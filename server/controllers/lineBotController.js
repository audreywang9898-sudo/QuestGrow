import pool from '../config/db.js';
import { validateSignature } from '../utils/lineBot.js';
import { sendTaskReviewConfirmation, sendRedeemReviewConfirmation } from '../utils/lineBot.js';

/**
 * Handle incoming LINE webhook events (Postback from parent buttons).
 * Called by: POST /api/line/webhook
 */
export const handleWebhook = async (req, res) => {
  // 1. Verify LINE signature
  const signature = req.headers['x-line-signature'] || req.headers['X-Line-Signature'];
  const rawBody = req.rawBody;

  const botSecret = process.env.LINE_BOT_CHANNEL_SECRET || '';
  const loginSecret = process.env.LINE_CHANNEL_SECRET || '';

  console.log(`[lineBotWebhook] Received header keys:`, Object.keys(req.headers));
  console.log(`[lineBotWebhook] Signature: ${signature}`);
  console.log(`[lineBotWebhook] rawBody length: ${rawBody ? rawBody.length : 0}`);
  console.log(`[lineBotWebhook] rawBody snippet:`, rawBody ? rawBody.substring(0, 200) : 'empty');
  console.log(`[lineBotWebhook] Secrets status: LINE_BOT_CHANNEL_SECRET len=${botSecret.length}, LINE_CHANNEL_SECRET len=${loginSecret.length}`);

  if (!validateSignature(rawBody, signature)) {
    console.warn('[lineBotController] Invalid LINE signature — request rejected.');
    return res.status(403).json({ message: 'Invalid signature' });
  }

  // 2. Acknowledge immediately (LINE requires 200 within 3s)
  res.status(200).json({ status: 'ok' });

  // 3. Process events asynchronously
  const events = req.body?.events || [];
  for (const event of events) {
    if (event.type === 'postback') {
      await handlePostback(event).catch(err =>
        console.error('[lineBotController] Postback error:', err)
      );
    }
  }
};

/**
 * Parse a postback event and execute the appropriate action.
 */
async function handlePostback(event) {
  const params = new URLSearchParams(event.postback?.data);
  const action = params.get('action');
  const token = params.get('token');
  const parentLineId = event.source?.userId;

  if (!action || !token) return;

  switch (action) {
    case 'approve_task': {
      const taskId = params.get('taskId');
      if (!taskId) return;
      await approveTask(taskId, token, parentLineId);
      break;
    }
    case 'reject_task': {
      const taskId = params.get('taskId');
      if (!taskId) return;
      await rejectTask(taskId, token, parentLineId);
      break;
    }
    case 'approve_redeem': {
      const inventoryId = params.get('inventoryId');
      if (!inventoryId) return;
      await approveRedeem(inventoryId, token, parentLineId);
      break;
    }
    case 'reject_redeem': {
      const inventoryId = params.get('inventoryId');
      if (!inventoryId) return;
      await rejectRedeem(inventoryId, token, parentLineId);
      break;
    }
    default:
      console.warn('[lineBotController] Unknown postback action:', action);
  }
}

// ─── Task: Approve ────────────────────────────────────────────────────────────

async function approveTask(taskId, token, parentLineId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify token, task state, and that the parent belongs to the same family
    const taskRes = await client.query(
      `SELECT t.id, t.status, t.exp_reward, t.gold_reward, t.ticket_reward,
              t.assigned_to AS child_id, t.name AS task_name, t.type AS task_type,
              t.difficulty, t.attribute_reward, t.line_review_token,
              c.name AS child_name, c.level, c.exp, c.exp_needed,
              c.gold, c.tickets, c.attributes,
              u.family_id
       FROM tasks t
       JOIN children c ON c.id = t.assigned_to
       JOIN users u ON u.family_id = c.user_id
       WHERE t.id = $1 AND u.line_id = $2 AND u.role = 'parent'`,
      [taskId, parentLineId]
    );

    // Fallback join via users.family_id
    let task = null;
    if (taskRes.rows.length > 0) {
      task = taskRes.rows[0];
    } else {
      // Try alternative join: parent's family_id matches child's user family
      const altRes = await client.query(
        `SELECT t.id, t.status, t.exp_reward, t.gold_reward, t.ticket_reward,
                t.assigned_to AS child_id, t.name AS task_name, t.type AS task_type,
                t.difficulty, t.attribute_reward, t.line_review_token,
                c.name AS child_name, c.level, c.exp, c.exp_needed,
                c.gold, c.tickets, c.attributes
         FROM tasks t
         JOIN children c ON c.id = t.assigned_to
         JOIN users cu ON cu.id = c.user_id
         JOIN users pu ON pu.family_id = cu.family_id AND pu.role = 'parent' AND pu.line_id = $2
         WHERE t.id = $1`,
        [taskId, parentLineId]
      );
      if (altRes.rows.length > 0) {
        task = altRes.rows[0];
      }
    }

    if (!task) {
      console.warn(`[lineBotController] approveTask: task ${taskId} not found or parent mismatch`);
      await client.query('ROLLBACK');
      return;
    }

    // Validate one-time token
    if (task.line_review_token !== token) {
      console.warn(`[lineBotController] approveTask: invalid token for task ${taskId}`);
      await client.query('ROLLBACK');
      return;
    }

    if (task.status !== '待覆核') {
      console.warn(`[lineBotController] approveTask: task ${taskId} not in review state (status: ${task.status})`);
      await client.query('ROLLBACK');
      // Push an already-processed notification
      await sendTaskReviewConfirmation(parentLineId, task.task_name, task.child_name, '已處理', null);
      return;
    }

    // Calculate EXP level-up
    const expReward = task.exp_reward || 100;
    let newExp = (task.exp || 0) + expReward;
    let newLevel = task.level || 1;
    let expNeeded = task.exp_needed || 400;

    while (newExp >= expNeeded) {
      newExp -= expNeeded;
      newLevel += 1;
      expNeeded = newLevel * 300 + 400;
    }

    // Update attributes if applicable
    const difficultyAttrMap = { '簡單': 1, '中等': 2, '較難': 3, '終極': 5 };
    const difficultyFamilyScoreMap = { '簡單': 25, '中等': 50, '較難': 100, '終極': 200 };
    const attrPoints = difficultyAttrMap[task.difficulty] || 1;
    const familyScoreAdd = difficultyFamilyScoreMap[task.difficulty] || 25;

    const attributes = task.attributes || {};
    if (task.attribute_reward && attributes[task.attribute_reward] !== undefined) {
      attributes[task.attribute_reward] += attrPoints;
    }

    // Update task status and invalidate token
    await client.query(
      `UPDATE tasks SET status = '已完成', line_review_token = NULL, reviewed_at = NOW(), completed_at = NOW() WHERE id = $1`,
      [taskId]
    );

    // Award EXP, Gold, Tickets to child
    const goldReward = task.gold_reward || 50;
    const ticketReward = task.ticket_reward || 1;
    await client.query(
      `UPDATE children 
       SET level = $1, exp = $2, exp_needed = $3, 
           gold = gold + $4, tickets = tickets + $5, 
           attributes = $6
       WHERE id = $7`,
      [newLevel, newExp, expNeeded, goldReward, ticketReward, JSON.stringify(attributes), task.child_id]
    );

    // Update family growth score
    const familyRes = await client.query(
      `SELECT family_id FROM users WHERE id = (SELECT user_id FROM children WHERE id = $1)`,
      [task.child_id]
    );
    if (familyRes.rows.length > 0) {
      await client.query(
        'UPDATE families SET growth_score = growth_score + $1 WHERE id = $2',
        [familyScoreAdd, familyRes.rows[0].family_id]
      );
    }

    await client.query('COMMIT');
    const tempClient = client;
    client = null;
    tempClient.release();

    console.log(`[lineBotController] Task ${taskId} approved via LINE by ${parentLineId}`);

    // Send confirmation message back to parent
    await sendTaskReviewConfirmation(parentLineId, task.task_name, task.child_name, 'approved', {
      expReward, goldReward, ticketReward, newLevel, levelUp: newLevel > (task.level || 1)
    });
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('[lineBotController] approveTask DB error:', err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ─── Task: Reject ─────────────────────────────────────────────────────────────

async function rejectTask(taskId, token, parentLineId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const taskRes = await client.query(
      `SELECT t.id, t.status, t.line_review_token, t.name AS task_name,
              c.name AS child_name
       FROM tasks t
       JOIN children c ON c.id = t.assigned_to
       JOIN users cu ON cu.id = c.user_id
       JOIN users pu ON pu.family_id = cu.family_id AND pu.role = 'parent' AND pu.line_id = $2
       WHERE t.id = $1`,
      [taskId, parentLineId]
    );

    if (taskRes.rows.length === 0) {
      console.warn(`[lineBotController] rejectTask: task ${taskId} not found or parent mismatch`);
      await client.query('ROLLBACK');
      return;
    }
    const task = taskRes.rows[0];

    if (task.line_review_token !== token) {
      console.warn(`[lineBotController] rejectTask: invalid token for task ${taskId}`);
      await client.query('ROLLBACK');
      return;
    }

    if (task.status !== '待覆核') {
      await client.query('ROLLBACK');
      await sendTaskReviewConfirmation(parentLineId, task.task_name, task.child_name, '已處理', null);
      return;
    }

    await client.query(
      `UPDATE tasks SET status = '進行中', line_review_token = NULL, reviewed_at = NOW() WHERE id = $1`,
      [taskId]
    );

    await client.query('COMMIT');
    const tempClient = client;
    client = null;
    tempClient.release();

    console.log(`[lineBotController] Task ${taskId} rejected via LINE by ${parentLineId}`);

    // Send confirmation message back to parent
    await sendTaskReviewConfirmation(parentLineId, task.task_name, task.child_name, 'rejected', null);
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('[lineBotController] rejectTask DB error:', err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ─── Redeem: Approve ──────────────────────────────────────────────────────────

async function approveRedeem(inventoryId, token, parentLineId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const invRes = await client.query(
      `SELECT inv.id, inv.status, inv.line_review_token, inv.name AS item_name,
              c.id AS child_id, c.name AS child_name,
              cu.family_id
       FROM inventory inv
       JOIN children c ON inv.child_id = c.id
       JOIN users cu ON cu.id = c.user_id
       JOIN users pu ON pu.family_id = cu.family_id AND pu.role = 'parent' AND pu.line_id = $2
       WHERE inv.id = $1`,
      [inventoryId, parentLineId]
    );

    if (invRes.rows.length === 0) {
      console.warn(`[lineBotController] approveRedeem: inventory ${inventoryId} not found or parent mismatch`);
      await client.query('ROLLBACK');
      return;
    }
    const inv = invRes.rows[0];

    if (inv.line_review_token !== token) {
      console.warn(`[lineBotController] approveRedeem: invalid token for inventory ${inventoryId}`);
      await client.query('ROLLBACK');
      return;
    }

    if (inv.status !== '待核銷') {
      await client.query('ROLLBACK');
      await sendRedeemReviewConfirmation(parentLineId, inv.item_name, inv.child_name, '已處理');
      return;
    }

    // Update inventory to redeemed
    await client.query(
      `UPDATE inventory SET status = '已使用', line_review_token = NULL, redeemed_at = NOW() WHERE id = $1`,
      [inventoryId]
    );

    // Add family growth score +50
    await client.query(
      'UPDATE families SET growth_score = growth_score + 50 WHERE id = $1',
      [inv.family_id]
    );

    await client.query('COMMIT');
    const tempClient = client;
    client = null;
    tempClient.release();

    console.log(`[lineBotController] Redeem ${inventoryId} approved via LINE by ${parentLineId}`);

    // Send confirmation message back to parent
    await sendRedeemReviewConfirmation(parentLineId, inv.item_name, inv.child_name, 'approved');
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('[lineBotController] approveRedeem DB error:', err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ─── Redeem: Reject ───────────────────────────────────────────────────────────

async function rejectRedeem(inventoryId, token, parentLineId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const invRes = await client.query(
      `SELECT inv.id, inv.status, inv.line_review_token, inv.name AS item_name,
              c.id AS child_id, c.name AS child_name
       FROM inventory inv
       JOIN children c ON inv.child_id = c.id
       JOIN users cu ON cu.id = c.user_id
       JOIN users pu ON pu.family_id = cu.family_id AND pu.role = 'parent' AND pu.line_id = $2
       WHERE inv.id = $1`,
      [inventoryId, parentLineId]
    );

    if (invRes.rows.length === 0) {
      console.warn(`[lineBotController] rejectRedeem: inventory ${inventoryId} not found or parent mismatch`);
      await client.query('ROLLBACK');
      return;
    }
    const inv = invRes.rows[0];

    if (inv.line_review_token !== token || inv.status !== '待核銷') {
      await client.query('ROLLBACK');
      return;
    }

    // Revert status to unused
    await client.query(
      `UPDATE inventory SET status = '未使用', line_review_token = NULL WHERE id = $1`,
      [inventoryId]
    );

    await client.query('COMMIT');
    const tempClient = client;
    client = null;
    tempClient.release();

    console.log(`[lineBotController] Redeem ${inventoryId} rejected via LINE by ${parentLineId}`);

    // Send confirmation message back to parent
    await sendRedeemReviewConfirmation(parentLineId, inv.item_name, inv.child_name, 'rejected');
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('[lineBotController] rejectRedeem DB error:', err);
  } finally {
    if (client) {
      client.release();
    }
  }
}
