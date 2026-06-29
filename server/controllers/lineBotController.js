import pool from '../config/db.js';
import { validateSignature } from '../utils/lineBot.js';

/**
 * Handle incoming LINE webhook events (Postback from parent buttons).
 * Called by: POST /api/line/webhook
 */
export const handleWebhook = async (req, res) => {
  // 1. Verify LINE signature
  const signature = req.headers['x-line-signature'] || req.headers['X-Line-Signature'] || req.headers['x-line-signature'];
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

  if (!action || !token) return;

  switch (action) {
    case 'approve_task': {
      const taskId = params.get('taskId');
      if (!taskId) return;
      await approveTask(taskId, token, event.source?.userId);
      break;
    }
    case 'reject_task': {
      const taskId = params.get('taskId');
      if (!taskId) return;
      await rejectTask(taskId, token, event.source?.userId);
      break;
    }
    case 'approve_redeem': {
      const inventoryId = params.get('inventoryId');
      if (!inventoryId) return;
      await approveRedeem(inventoryId, token, event.source?.userId);
      break;
    }
    case 'reject_redeem': {
      const inventoryId = params.get('inventoryId');
      if (!inventoryId) return;
      await rejectRedeem(inventoryId, token, event.source?.userId);
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

    // Verify token and task state
    const taskRes = await client.query(
      `SELECT t.id, t.status, t.points, t.child_id, t.line_review_token,
              c.family_id, c.name AS child_name,
              u.line_id AS parent_line_id
       FROM tasks t
       JOIN children c ON t.child_id = c.id
       JOIN families f ON c.family_id = f.id
       JOIN users u ON u.family_id = f.id AND u.role = 'parent' AND u.line_id = $2
       WHERE t.id = $1`,
      [taskId, parentLineId]
    );

    if (taskRes.rows.length === 0) {
      console.warn(`[lineBotController] approveTask: task ${taskId} not found or parent mismatch`);
      return;
    }

    const task = taskRes.rows[0];

    // Validate one-time token
    if (task.line_review_token !== token) {
      console.warn(`[lineBotController] approveTask: invalid token for task ${taskId}`);
      await client.query('ROLLBACK');
      return;
    }

    if (task.status !== '待覆核') {
      console.warn(`[lineBotController] approveTask: task ${taskId} is not pending review (status: ${task.status})`);
      await client.query('ROLLBACK');
      return;
    }

    // Update task status and invalidate token
    await client.query(
      `UPDATE tasks SET status = '已完成', line_review_token = NULL, reviewed_at = NOW() WHERE id = $1`,
      [taskId]
    );

    // Award points to child's stat record
    await client.query(
      `UPDATE child_stats SET total_points = total_points + $1, current_points = current_points + $1 WHERE child_id = $2`,
      [task.points, task.child_id]
    );

    await client.query('COMMIT');
    console.log(`[lineBotController] Task ${taskId} approved via LINE by ${parentLineId}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[lineBotController] approveTask DB error:', err);
  } finally {
    client.release();
  }
}

// ─── Task: Reject ─────────────────────────────────────────────────────────────

async function rejectTask(taskId, token, parentLineId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const taskRes = await client.query(
      `SELECT t.id, t.status, t.line_review_token, u.line_id
       FROM tasks t
       JOIN children c ON t.child_id = c.id
       JOIN families f ON c.family_id = f.id
       JOIN users u ON u.family_id = f.id AND u.role = 'parent' AND u.line_id = $2
       WHERE t.id = $1`,
      [taskId, parentLineId]
    );

    if (taskRes.rows.length === 0) return;
    const task = taskRes.rows[0];

    if (task.line_review_token !== token || task.status !== '待覆核') {
      await client.query('ROLLBACK');
      return;
    }

    await client.query(
      `UPDATE tasks SET status = '未完成', line_review_token = NULL WHERE id = $1`,
      [taskId]
    );

    await client.query('COMMIT');
    console.log(`[lineBotController] Task ${taskId} rejected via LINE by ${parentLineId}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[lineBotController] rejectTask DB error:', err);
  } finally {
    client.release();
  }
}

// ─── Redeem: Approve ──────────────────────────────────────────────────────────

async function approveRedeem(inventoryId, token, parentLineId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const invRes = await client.query(
      `SELECT inv.id, inv.status, inv.line_review_token, inv.item_id, inv.child_id
       FROM inventory inv
       JOIN children c ON inv.child_id = c.id
       JOIN families f ON c.family_id = f.id
       JOIN users u ON u.family_id = f.id AND u.role = 'parent' AND u.line_id = $2
       WHERE inv.id = $1`,
      [inventoryId, parentLineId]
    );

    if (invRes.rows.length === 0) return;
    const inv = invRes.rows[0];

    if (inv.line_review_token !== token || inv.status !== '待核銷') {
      await client.query('ROLLBACK');
      return;
    }

    await client.query(
      `UPDATE inventory SET status = '已核銷', line_review_token = NULL, redeemed_at = NOW() WHERE id = $1`,
      [inventoryId]
    );

    await client.query('COMMIT');
    console.log(`[lineBotController] Redeem ${inventoryId} approved via LINE`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[lineBotController] approveRedeem DB error:', err);
  } finally {
    client.release();
  }
}

// ─── Redeem: Reject ───────────────────────────────────────────────────────────

async function rejectRedeem(inventoryId, token, parentLineId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const invRes = await client.query(
      `SELECT inv.id, inv.status, inv.line_review_token, inv.item_id, inv.child_id,
              i.point_cost
       FROM inventory inv
       JOIN items i ON inv.item_id = i.id
       JOIN children c ON inv.child_id = c.id
       JOIN families f ON c.family_id = f.id
       JOIN users u ON u.family_id = f.id AND u.role = 'parent' AND u.line_id = $2
       WHERE inv.id = $1`,
      [inventoryId, parentLineId]
    );

    if (invRes.rows.length === 0) return;
    const inv = invRes.rows[0];

    if (inv.line_review_token !== token || inv.status !== '待核銷') {
      await client.query('ROLLBACK');
      return;
    }

    // Refund points
    await client.query(
      `UPDATE inventory SET status = '已拒絕', line_review_token = NULL WHERE id = $1`,
      [inventoryId]
    );
    await client.query(
      `UPDATE child_stats SET current_points = current_points + $1 WHERE child_id = $2`,
      [inv.point_cost, inv.child_id]
    );

    await client.query('COMMIT');
    console.log(`[lineBotController] Redeem ${inventoryId} rejected via LINE (points refunded)`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[lineBotController] rejectRedeem DB error:', err);
  } finally {
    client.release();
  }
}
