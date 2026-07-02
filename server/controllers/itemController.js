import pool from '../config/db.js';
import { getMessage } from '../utils/messageManager.js';
import { GACHA_POOL } from '../../src/utils/mockData.js';
import { sendRedeemReviewRequest } from '../utils/lineBot.js';
import { randomUUID } from 'crypto';
import { decryptField } from '../utils/encryption.js';

const getExpirationDate = (rarity) => {
  let days = 9999;
  if (rarity === 'Rare') days = 7;
  else if (rarity === 'Epic') days = 30;

  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Rarity draw order, rarest first — matches the cumulative-threshold logic
// previously implemented client-side (KidPortal.jsx), now the single source of truth.
const RARITY_DRAW_ORDER = ['Mythic', 'Legendary', 'Epic', 'Rare', 'Common'];

// Server-side weighted rarity + card selection. Never trust a client-supplied card.
const pickGachaCard = (gachaPool, recentDrawnIds) => {
  const rand = Math.random();
  let cumulative = 0;
  let raritySelected = 'Common';
  for (const rarity of RARITY_DRAW_ORDER) {
    const chance = gachaPool?.[rarity]?.chance;
    if (typeof chance !== 'number') continue;
    cumulative += chance;
    if (rand < cumulative) {
      raritySelected = rarity;
      break;
    }
  }

  let rarityPool = gachaPool?.[raritySelected]?.cards || [];
  if (rarityPool.length === 0) {
    // Fallback if the family misconfigured/emptied this rarity's pool
    raritySelected = 'Common';
    rarityPool = gachaPool?.Common?.cards || [];
  }
  if (rarityPool.length === 0) {
    return null;
  }

  let filteredPool = rarityPool.filter(c => !recentDrawnIds.has(c.id));
  if (filteredPool.length === 0) {
    filteredPool = rarityPool;
  }

  return filteredPool[Math.floor(Math.random() * filteredPool.length)];
};

// 1. Get Inventory Items (For kids: get their own; for parents: get all in family)
export const getInventory = async (req, res) => {
  const familyId = req.user.family_id;
  const childId = req.user.child_id;

  try {
    let query = '';
    const params = [];

    // LIMIT is a safety net against unbounded growth — not real pagination.
    if (childId) {
      // Kid: query only their own backpack
      query = `
        SELECT id, child_id, card_template_id, name, type, rarity, description, status, date_acquired, expire_at
        FROM inventory
        WHERE child_id = $1
        ORDER BY date_acquired DESC
        LIMIT 1000`;
      params.push(childId);
    } else {
      // Parent: query all children's backpacks in family
      query = `
        SELECT i.id, i.child_id, i.card_template_id, i.name, i.type, i.rarity, i.description, i.status, i.date_acquired, i.expire_at, c.name as owner_name
        FROM inventory i
        JOIN children c ON i.child_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE u.family_id = $1
        ORDER BY i.date_acquired DESC
        LIMIT 1000`;
      params.push(familyId);
    }

    const result = await pool.query(query, params);
    
    // Map database snake_case to frontend camelCase
    const mapped = result.rows.map(row => ({
      inventoryId: row.id,
      childId: row.child_id,
      id: row.card_template_id,
      name: row.name,
      type: row.type,
      rarity: row.rarity,
      desc: row.description,
      status: row.status,
      dateAcquired: row.date_acquired ? row.date_acquired.toISOString().split('T')[0] : null,
      expireAt: row.expire_at ? row.expire_at.toISOString().split('T')[0] : null,
      ownerName: row.owner_name || null
    }));

    res.json(mapped);
  } catch (error) {
    console.error('getInventory error:', error);
    res.status(500).json({ message: getMessage('FETCH_INVENTORY_ERROR') });
  }
};

// 2. Get Redeem Logs
export const getRedeemLogs = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      `SELECT id, family_id, card_name, kid_name, date_redeemed, status, reviewer
       FROM redeem_logs
       WHERE family_id = $1
       ORDER BY date_redeemed DESC
       LIMIT 500`,
      [familyId]
    );

    const mapped = result.rows.map(row => ({
      id: row.id,
      cardName: row.card_name,
      kidName: row.kid_name,
      dateRedeemed: row.date_redeemed ? row.date_redeemed.toISOString().split('T')[0] : null,
      status: row.status,
      reviewer: row.reviewer
    }));

    res.json(mapped);
  } catch (error) {
    console.error('getRedeemLogs error:', error);
    res.status(500).json({ message: getMessage('FETCH_REDEEM_LOGS_ERROR') });
  }
};

// 3. Gacha Draw (Atomic Transaction)
// SECURITY: the drawn card is always chosen by the server from the family's
// (or default) gacha pool — the client never supplies the card, only the ticket cost.
export const drawGachaCard = async (req, res) => {
  const familyId = req.user.family_id;
  const childId = req.user.child_id;
  const { costTickets } = req.body;

  if (!childId) {
    return res.status(403).json({ message: getMessage('GACHA_DRAW_ROLE_ERROR') });
  }

  // Enforce costTickets is a safe positive integer (prevents free/negative-cost draws)
  const safeCost = Number.isInteger(Math.floor(Number(costTickets))) ? Math.floor(Number(costTickets)) : 1;
  if (!Number.isInteger(safeCost) || safeCost < 1 || safeCost > 20) {
    return res.status(400).json({ message: '無效的抽卡費用。' });
  }

  // Resource-card reward caps (defense-in-depth even though values now come
  // from the server-held pool, not the client).
  const MAX_GOLD_REWARD    = 200;
  const MAX_TICKETS_REWARD = 10;
  const MAX_EXP_REWARD     = 500;
  const MAX_GROWTH_REWARD  = 200;
  const clamp = (n, max) => Math.min(Math.max(0, Math.floor(Number(n) || 0)), max);

  const gachaClient = await pool.connect();
  try {
    await gachaClient.query('BEGIN');

    // 1. Atomically verify + deduct tickets in one statement. The UPDATE takes
    // a row lock on this child for the rest of the transaction, so subsequent
    // reads/writes to the same row within this transaction are race-free —
    // this closes the concurrent-draw ticket-farming race condition.
    const deductResult = await gachaClient.query(
      `UPDATE children SET tickets = tickets - $1
       WHERE id = $2 AND tickets >= $1
       RETURNING id, name, tickets, gold, level, exp, exp_needed`,
      [safeCost, childId]
    );
    if (deductResult.rows.length === 0) {
      // Either the child doesn't exist, or (far more likely) insufficient tickets
      const existsResult = await gachaClient.query('SELECT id FROM children WHERE id = $1', [childId]);
      throw new Error(existsResult.rows.length === 0 ? getMessage('CHILD_STATS_NOT_FOUND') : getMessage('GACHA_INSUFFICIENT_TICKETS'));
    }
    const child = deductResult.rows[0];

    // 2. Load the family's gacha pool (or the default pool)
    const familyResult = await gachaClient.query('SELECT gacha_pool FROM families WHERE id = $1', [familyId]);
    const familyGachaPool = (familyResult.rows.length > 0 && familyResult.rows[0].gacha_pool)
      ? familyResult.rows[0].gacha_pool
      : GACHA_POOL;

    // 3. Find cards drawn by this child in the last 7 days (across all rarities,
    // since we don't know the rarity we'll land on yet)
    const recentDrawsResult = await gachaClient.query(
      `SELECT DISTINCT card_template_id
       FROM inventory
       WHERE child_id = $1 AND date_acquired >= CURRENT_DATE - 7`,
      [childId]
    );
    const recentDrawnIds = new Set(recentDrawsResult.rows.map(r => r.card_template_id));

    // 4. Server picks the rarity + card — the client has no influence over this.
    const card = pickGachaCard(familyGachaPool, recentDrawnIds);
    if (!card) {
      throw new Error('轉蛋獎池尚未設定，請聯絡家長。 | Gacha pool is not configured.');
    }

    // 5. Handle Resource Cards (applied immediately, reward values clamped)
    let newGold = child.gold;
    let newTickets = child.tickets;
    let newExp = child.exp;
    let newLevel = child.level;
    let expNeeded = child.exp_needed;

    if (card.type === "資源卡" && card.value) {
      if (card.value.gold) {
        newGold += clamp(card.value.gold, MAX_GOLD_REWARD);
      }
      if (card.value.tickets) {
        newTickets += clamp(card.value.tickets, MAX_TICKETS_REWARD);
      }
      if (card.value.exp) {
        newExp += clamp(card.value.exp, MAX_EXP_REWARD);
        while (newExp >= expNeeded) {
          newExp -= expNeeded;
          newLevel += 1;
          expNeeded = newLevel * 300 + 400;
        }
      }
      if (card.value.growthScore) {
        await gachaClient.query(
          'UPDATE families SET growth_score = growth_score + $1 WHERE id = $2',
          [clamp(card.value.growthScore, MAX_GROWTH_REWARD), familyId]
        );
      }

      // Persist resource-card gains (tickets already reflects the draw-cost deduction above)
      await gachaClient.query(
        `UPDATE children
         SET tickets = $1, gold = $2, exp = $3, level = $4, exp_needed = $5
         WHERE id = $6`,
        [newTickets, newGold, newExp, newLevel, expNeeded, childId]
      );
    }

    // 6. Insert into inventory (resource cards are inserted with status '已使用')
    const status = card.type === "資源卡" ? "已使用" : "未使用";
    const expireAt = card.type === "資源卡" ? null : getExpirationDate(card.rarity);
    const insertResult = await gachaClient.query(
      `INSERT INTO inventory (child_id, card_template_id, name, type, rarity, description, status, expire_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, child_id, card_template_id, name, type, rarity, description, status, date_acquired, expire_at`,
      [childId, card.id, card.name, card.type, card.rarity, card.desc, status, expireAt]
    );
    const row = insertResult.rows[0];
    const newItem = {
      inventoryId: row.id,
      childId: row.child_id,
      id: row.card_template_id,
      name: row.name,
      type: row.type,
      rarity: row.rarity,
      desc: row.description,
      status: row.status,
      dateAcquired: row.date_acquired ? row.date_acquired.toISOString().split('T')[0] : null,
      expireAt: row.expire_at ? row.expire_at.toISOString().split('T')[0] : null
    };

    await gachaClient.query('COMMIT');

    // Get updated child profile to send back
    const updatedChildResult = await pool.query(
      'SELECT id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes FROM children WHERE id = $1',
      [childId]
    );
    const updatedChild = updatedChildResult.rows[0];
    if (updatedChild) updatedChild.birthday = decryptField(updatedChild.birthday);

    res.json({
      message: getMessage('GACHA_DRAW_SUCCESS', { name: card.name }),
      child: updatedChild,
      item: newItem
    });
  } catch (error) {
    await gachaClient.query('ROLLBACK');
    console.error('drawGachaCard error:', error);
    res.status(500).json({ message: error.message || getMessage('GACHA_DRAW_ERROR') });
  } finally {
    gachaClient.release();
  }
};

// 4. Request Redeem (Kid only)
export const requestRedeem = async (req, res) => {
  const childId = req.user.child_id;
  const { inventoryId } = req.params;

  if (!childId) {
    return res.status(403).json({ message: getMessage('REDEEM_REQUEST_ROLE_ERROR') });
  }

  try {
    // Check ownership and status
    const result = await pool.query(
      'SELECT id, name, status, expire_at FROM inventory WHERE id = $1 AND child_id = $2',
      [inventoryId, childId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: getMessage('REDEEM_REQUEST_CARD_NOT_FOUND') });
    }

    const item = result.rows[0];

    if (item.status !== '未使用') {
      return res.status(400).json({ message: getMessage('REDEEM_REQUEST_STATUS_INVALID', { status: item.status }) });
    }

    // Check expiration
    if (item.expire_at && new Date(item.expire_at) < new Date()) {
      await pool.query('UPDATE inventory SET status = \'已過期\' WHERE id = $1', [inventoryId]);
      return res.status(400).json({ message: getMessage('REDEEM_REQUEST_CARD_EXPIRED') });
    }

    const reviewToken = randomUUID();
    await pool.query(
      'UPDATE inventory SET status = \'待核銷\', line_review_token = $1 WHERE id = $2',
      [reviewToken, inventoryId]
    );

    // --- LINE Bot: Push redeem review notification to parent(s) ---
    try {
      const notifyRes = await pool.query(
        `SELECT inv.id, inv.name AS item_name,
                c.name AS child_name, c.gold, c.tickets,
                pu.line_id AS parent_line_id
         FROM inventory inv
         JOIN children c ON inv.child_id = c.id
         JOIN users cu ON cu.id = c.user_id
         JOIN users pu ON pu.family_id = cu.family_id AND pu.role = 'parent' AND pu.line_id IS NOT NULL
         WHERE inv.id = $1`,
        [inventoryId]
      );

      if (notifyRes.rows.length > 0) {
        const firstRow = notifyRes.rows[0];
        const itemInfo = {
          inventoryId: inventoryId,
          name: firstRow.item_name,
          pointCost: 0  // Gacha cards don't have a point cost — they cost tickets
        };
        const childName = firstRow.child_name;
        const currentTickets = firstRow.tickets || 0;

        const uniqueParentIds = [...new Set(notifyRes.rows.map(r => r.parent_line_id).filter(Boolean))];
        await Promise.all(
          uniqueParentIds.map(lineId =>
            sendRedeemReviewRequest(lineId, itemInfo, childName, currentTickets, reviewToken)
          )
        );
      }
    } catch (lineErr) {
      console.error('[requestRedeem] LINE notification error (non-fatal):', lineErr.message);
    }
    // ---

    res.json({ message: getMessage('REDEEM_REQUEST_SUCCESS', { name: item.name }) });
  } catch (error) {
    console.error('requestRedeem error:', error);
    res.status(500).json({ message: getMessage('REDEEM_REQUEST_ERROR') });
  }
};

// 5. Review Redeem (Parent only: Approve or Reject)
export const reviewRedeem = async (req, res) => {
  const familyId = req.user.family_id;
  const parentName = req.user.name;
  const { inventoryId } = req.params;
  const { action } = req.body; // 'approve' | 'reject'

  if (!action) {
    return res.status(400).json({ message: getMessage('REVIEW_REDEEM_ACTION_MISSING') });
  }

  try {
    // Verify item belongs to this family and is pending review
    const itemResult = await pool.query(
      `SELECT i.id, i.name, i.status, i.expire_at, c.name as kid_name
       FROM inventory i
       JOIN children c ON i.child_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE i.id = $1 AND u.family_id = $2`,
      [inventoryId, familyId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: getMessage('REVIEW_REDEEM_NOT_FOUND') });
    }

    const item = itemResult.rows[0];

    if (item.status !== '待核銷') {
      return res.status(400).json({ message: getMessage('REVIEW_REDEEM_STATUS_INVALID') });
    }

    if (action === 'reject') {
      // Reject: Return to '未使用'
      await pool.query(
        'UPDATE inventory SET status = \'未使用\' WHERE id = $1',
        [inventoryId]
      );
      return res.json({ message: getMessage('REVIEW_REDEEM_REJECT_SUCCESS', { name: item.name }) });
    }

    if (action === 'approve') {
      // Approve: Check expiration first
      if (item.expire_at && new Date(item.expire_at) < new Date()) {
        await pool.query('UPDATE inventory SET status = \'已過期\' WHERE id = $1', [inventoryId]);
        return res.status(400).json({ message: getMessage('REVIEW_REDEEM_EXPIRED') });
      }

      const redeemClient = await pool.connect();
      try {
        await redeemClient.query('BEGIN');

        // Set status to '已使用'
        await redeemClient.query(
          'UPDATE inventory SET status = \'\u5df2\u4f7f\u7528\' WHERE id = $1',
          [inventoryId]
        );

        // Create redeem log
        await redeemClient.query(
          `INSERT INTO redeem_logs (family_id, card_name, kid_name, date_redeemed, status, reviewer)
           VALUES ($1, $2, $3, CURRENT_DATE, '已核銷', $4)`,
          [familyId, item.name, item.kid_name, `${parentName} (審核)`]
        );

        // Family growth score + 50
        await redeemClient.query(
          'UPDATE families SET growth_score = growth_score + 50 WHERE id = $1',
          [familyId]
        );

        await redeemClient.query('COMMIT');
      } catch (txError) {
        await redeemClient.query('ROLLBACK');
        throw txError;
      } finally {
        redeemClient.release();
      }

      return res.json({ message: getMessage('REVIEW_REDEEM_APPROVE_SUCCESS', { name: item.name }) });
    }
  } catch (error) {
    console.error('reviewRedeem error:', error);
    res.status(500).json({ message: getMessage('REVIEW_REDEEM_ERROR') });
  }
};

// 6. Toggle equip cosmetic card (kid or parent)
export const toggleEquipItem = async (req, res) => {
  const childId = req.user.child_id;
  const familyId = req.user.family_id;
  const { inventoryId } = req.params;

  try {
    let itemResult;
    if (childId) {
      itemResult = await pool.query(
        'SELECT * FROM inventory WHERE id = $1 AND child_id = $2',
        [inventoryId, childId]
      );
    } else if (req.user.role === 'parent') {
      itemResult = await pool.query(
        `SELECT i.* FROM inventory i
         JOIN children c ON i.child_id = c.id
         JOIN users u ON c.user_id = u.id
         WHERE i.id = $1 AND u.family_id = $2`,
        [inventoryId, familyId]
      );
    } else {
      return res.status(403).json({ message: '無效的使用者角色。 | Invalid user role.' });
    }

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: '找不到此道具卡！ | Inventory item not found.' });
    }

    const item = itemResult.rows[0];

    if (item.type !== '收藏卡') {
      return res.status(400).json({ message: '只有收藏卡可以配戴！ | Only collection cards can be equipped.' });
    }

    const currentStatus = item.status;
    let newStatus = '未使用';

    const equipClient = await pool.connect();
    try {
      await equipClient.query('BEGIN');

      if (currentStatus === '未使用') {
        newStatus = '已使用';
        await equipClient.query(
          "UPDATE inventory SET status = '\u672a\u4f7f\u7528' WHERE child_id = $1 AND type = '\u6536\u85cf\u5361' AND status = '\u5df2\u4f7f\u7528'",
          [item.child_id]
        );
      }

      await equipClient.query(
        'UPDATE inventory SET status = $1 WHERE id = $2',
        [newStatus, inventoryId]
      );

      await equipClient.query('COMMIT');
    } catch (txError) {
      await equipClient.query('ROLLBACK');
      throw txError;
    } finally {
      equipClient.release();
    }

    res.json({
      message: newStatus === '已使用' ? '已成功配戴徽章！ | Badge equipped successfully!' : '已成功取下徽章。 | Badge unequipped successfully!',
      status: newStatus
    });
  } catch (error) {
    console.error('toggleEquipItem error:', error);
    res.status(500).json({ message: '配戴徽章失敗，請稍後再試。 | Failed to equip badge.' });
  }
};

// 7. Buy Summon Ticket with Gold (300 Gold = 1 Ticket) - Kid only
export const buyTicketWithGold = async (req, res) => {
  const childId = req.user.child_id;
  const familyId = req.user.family_id;
  const userId = req.user.id;

  if (!childId) {
    return res.status(403).json({ message: '此操作僅限小孩帳號執行。 | This operation is only allowed for kid accounts.' });
  }

  const ticketClient = await pool.connect();
  try {
    await ticketClient.query('BEGIN');

    const COST_GOLD = 300;

    // 1. Atomically verify + spend gold / grant ticket in one statement.
    // Using a WHERE-clause balance check instead of read-then-write closes the
    // race condition where concurrent requests could each read the same stale
    // balance and all pass the check (double/triple-spend farming).
    const updateResult = await ticketClient.query(
      `UPDATE children SET gold = gold - $1, tickets = tickets + 1
       WHERE id = $2 AND gold >= $1
       RETURNING id, name, tickets, gold`,
      [COST_GOLD, childId]
    );
    if (updateResult.rows.length === 0) {
      const existsResult = await ticketClient.query('SELECT id FROM children WHERE id = $1', [childId]);
      throw new Error(existsResult.rows.length === 0
        ? '找不到小孩角色狀態。 | Child profile not found.'
        : '金幣不足，無法兌換抽卡券。 | Insufficient gold to buy ticket.');
    }
    const child = updateResult.rows[0];

    // 2. Write event log for telemetry
    await ticketClient.query(
      `INSERT INTO event_logs (family_id, user_id, event_type, metadata)
       VALUES ($1, $2, $3, $4)`,
      [
        familyId,
        userId,
        'SHOP_BUY_TICKET',
        JSON.stringify({
          childName: child.name,
          costGold: COST_GOLD,
          quantity: 1
        })
      ]
    );

    await ticketClient.query('COMMIT');

    // Fetch updated child profile to send back
    const updatedChildResult = await pool.query(
      'SELECT id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes FROM children WHERE id = $1',
      [childId]
    );
    const updatedChild = updatedChildResult.rows[0];
    if (updatedChild) updatedChild.birthday = decryptField(updatedChild.birthday);

    res.json({
      message: '成功使用 300 金幣兌換 1 張抽卡券！ | Successfully exchanged 300 gold for 1 summon ticket!',
      child: updatedChild
    });
  } catch (error) {
    await ticketClient.query('ROLLBACK');
    console.error('buyTicketWithGold error:', error);
    res.status(400).json({ message: error.message || '兌換失敗，請稍後再試。' });
  } finally {
    ticketClient.release();
  }
};

// 8. Cancel Redeem Request (Kid only: revert status from '待核銷' to '未使用')
export const cancelRedeem = async (req, res) => {
  const childId = req.user.child_id;
  const { inventoryId } = req.params;

  if (!childId) {
    return res.status(403).json({ message: '此操作僅限小孩帳號執行。 | This operation is only allowed for kid accounts.' });
  }

  try {
    // Check ownership and status
    const result = await pool.query(
      'SELECT id, name, status FROM inventory WHERE id = $1 AND child_id = $2',
      [inventoryId, childId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '找不到此道具卡。 | Card not found.' });
    }

    const item = result.rows[0];

    if (item.status !== '待核銷') {
      return res.status(400).json({ message: '只有等待核銷的卡片可以取消申請。 | Only cards pending review can be cancelled.' });
    }

    await pool.query(
      "UPDATE inventory SET status = '未使用' WHERE id = $1",
      [inventoryId]
    );

    res.json({ message: `已成功回復核銷！卡片「${item.name}」已還原為未使用狀態。 | Cancelled redemption request successfully!` });
  } catch (error) {
    console.error('cancelRedeem error:', error);
    res.status(500).json({ message: '取消核銷申請失敗，請稍後再試。 | Failed to cancel redemption request.' });
  }
};


