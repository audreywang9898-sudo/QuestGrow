import pool from '../config/db.js';
import { getMessage } from '../utils/messageManager.js';
import { GACHA_POOL } from '../../src/utils/mockData.js';
import { sendRedeemReviewRequest } from '../utils/lineBot.js';
import { randomUUID } from 'crypto';

const getExpirationDate = (rarity) => {
  let days = 9999;
  if (rarity === 'Rare') days = 7;
  else if (rarity === 'Epic') days = 30;
  
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// 1. Get Inventory Items (For kids: get their own; for parents: get all in family)
export const getInventory = async (req, res) => {
  const familyId = req.user.family_id;
  const childId = req.user.child_id;

  try {
    let query = '';
    const params = [];

    if (childId) {
      // Kid: query only their own backpack
      query = `
        SELECT id, child_id, card_template_id, name, type, rarity, description, status, date_acquired, expire_at
        FROM inventory
        WHERE child_id = $1
        ORDER BY date_acquired DESC`;
      params.push(childId);
    } else {
      // Parent: query all children's backpacks in family
      query = `
        SELECT i.id, i.child_id, i.card_template_id, i.name, i.type, i.rarity, i.description, i.status, i.date_acquired, i.expire_at, c.name as owner_name
        FROM inventory i
        JOIN children c ON i.child_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE u.family_id = $1
        ORDER BY i.date_acquired DESC`;
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
       ORDER BY date_redeemed DESC`,
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
export const drawGachaCard = async (req, res) => {
  const familyId = req.user.family_id;
  const childId = req.user.child_id;
  const { card, costTickets } = req.body;

  if (!childId) {
    return res.status(403).json({ message: getMessage('GACHA_DRAW_ROLE_ERROR') });
  }
  if (!card || costTickets === undefined) {
    return res.status(400).json({ message: getMessage('GACHA_DRAW_FIELDS_MISSING') });
  }

  // ── Server-side Gacha Validation ────────────────────────────────────
  // 1. Enforce costTickets is a safe positive integer (prevents free draws)
  const safeCost = Math.floor(Number(costTickets));
  if (!Number.isInteger(safeCost) || safeCost < 1 || safeCost > 20) {
    return res.status(400).json({ message: '無效的抽卡費用。' });
  }

  // 2. Validate card type and rarity against server-side allowlists
  const ALLOWED_TYPES = ['裝備卡', '收藏卡', '技能卡', '資源卡', '特權卡', '體驗卡'];
  const ALLOWED_RARITIES = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
  if (!ALLOWED_TYPES.includes(card.type)) {
    return res.status(400).json({ message: '無效的卡片類型。' });
  }
  if (card.rarity && !ALLOWED_RARITIES.includes(card.rarity)) {
    return res.status(400).json({ message: '無效的稀有度。' });
  }

  // 3. For resource cards: cap reward values to prevent economy manipulation
  if (card.type === '資源卡' && card.value) {
    const MAX_GOLD_REWARD      = 200;
    const MAX_TICKETS_REWARD   = 10;
    const MAX_EXP_REWARD       = 500;
    const MAX_GROWTH_REWARD    = 200;

    if (card.value.gold !== undefined) {
      card.value.gold = Math.min(Math.max(0, Math.floor(Number(card.value.gold) || 0)), MAX_GOLD_REWARD);
    }
    if (card.value.tickets !== undefined) {
      card.value.tickets = Math.min(Math.max(0, Math.floor(Number(card.value.tickets) || 0)), MAX_TICKETS_REWARD);
    }
    if (card.value.exp !== undefined) {
      card.value.exp = Math.min(Math.max(0, Math.floor(Number(card.value.exp) || 0)), MAX_EXP_REWARD);
    }
    if (card.value.growthScore !== undefined) {
      card.value.growthScore = Math.min(Math.max(0, Math.floor(Number(card.value.growthScore) || 0)), MAX_GROWTH_REWARD);
    }
  }
  // ── End Validation ───────────────────────────────────────────────────

  try {
    await pool.query('BEGIN');

    // 1. Verify child has enough tickets
    const childResult = await pool.query(
      'SELECT id, name, tickets, gold, level, exp, exp_needed FROM children WHERE id = $1',
      [childId]
    );
    if (childResult.rows.length === 0) {
      throw new Error(getMessage('CHILD_STATS_NOT_FOUND'));
    }
    const child = childResult.rows[0];

    if (child.tickets < safeCost) {
      throw new Error(getMessage('GACHA_INSUFFICIENT_TICKETS'));
    }

    // 1.5. Server-side 7-day cooldown validation with downgrade fallback
    const familyResult = await pool.query('SELECT gacha_pool FROM families WHERE id = $1', [familyId]);
    const familyGachaPool = (familyResult.rows.length > 0 && familyResult.rows[0].gacha_pool)
      ? familyResult.rows[0].gacha_pool
      : GACHA_POOL;

    // Get all cards of the drawn rarity
    const rarityPool = familyGachaPool[card.rarity]?.cards || [];
    const rarityCardIds = rarityPool.map(c => c.id);

    // Find which of these card IDs have been acquired by this child in the last 7 days
    const recentDrawsResult = await pool.query(
      `SELECT DISTINCT card_template_id 
       FROM inventory 
       WHERE child_id = $1 AND card_template_id = ANY($2) AND date_acquired >= CURRENT_DATE - 7`,
      [childId, rarityCardIds]
    );
    const recentDrawnIds = new Set(recentDrawsResult.rows.map(r => r.card_template_id));

    // If the drawn card is in the recent draws set
    if (recentDrawnIds.has(card.id)) {
      // Check if there is at least one card in this rarity that is NOT on cooldown
      const hasAvailableCards = rarityCardIds.some(id => !recentDrawnIds.has(id));
      if (hasAvailableCards) {
        throw new Error('該獎勵卡片在 7 天內已獲得過，不能重複獲得。 | This reward card is on cooldown and cannot be drawn again.');
      }
    }

    // Deduct tickets (using server-validated cost)
    let newTickets = Math.max(0, child.tickets - safeCost);
    let newGold = child.gold;
    let newExp = child.exp;
    let newLevel = child.level;
    let expNeeded = child.exp_needed;

    // 2. Handle Resource Cards (applied immediately)
    if (card.type === "資源卡") {
      if (card.value?.gold) {
        newGold += card.value.gold;
      }
      if (card.value?.tickets) {
        newTickets += card.value.tickets;
      }
      if (card.value?.exp) {
        newExp += card.value.exp;
        while (newExp >= expNeeded) {
          newExp -= expNeeded;
          newLevel += 1;
          expNeeded = newLevel * 300 + 400;
        }
      }
      if (card.value?.growthScore) {
        await pool.query(
          'UPDATE families SET growth_score = growth_score + $1 WHERE id = $2',
          [card.value.growthScore, familyId]
        );
      }
    }

    // Update child stats in database
    await pool.query(
      `UPDATE children 
       SET tickets = $1, gold = $2, exp = $3, level = $4, exp_needed = $5 
       WHERE id = $6`,
      [newTickets, newGold, newExp, newLevel, expNeeded, childId]
    );

    // 3. For all cards, insert into inventory (resource cards are inserted with status '已使用')
    let newItem = null;
    const status = card.type === "資源卡" ? "已使用" : "未使用";
    const expireAt = card.type === "資源卡" ? null : getExpirationDate(card.rarity);
    const insertResult = await pool.query(
      `INSERT INTO inventory (child_id, card_template_id, name, type, rarity, description, status, expire_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, child_id, card_template_id, name, type, rarity, description, status, date_acquired, expire_at`,
      [childId, card.id, card.name, card.type, card.rarity, card.desc, status, expireAt]
    );
    const row = insertResult.rows[0];
    newItem = {
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

    await pool.query('COMMIT');

    // Get updated child profile to send back
    const updatedChildResult = await pool.query(
      'SELECT id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes FROM children WHERE id = $1',
      [childId]
    );

    res.json({
      message: getMessage('GACHA_DRAW_SUCCESS', { name: card.name }),
      child: updatedChildResult.rows[0],
      item: newItem
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('drawGachaCard error:', error);
    res.status(500).json({ message: error.message || getMessage('GACHA_DRAW_ERROR') });
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
        `SELECT inv.id, inv.name, i.point_cost,
                c.name AS child_name,
                cs.current_points,
                u.line_id AS parent_line_id
         FROM inventory inv
         LEFT JOIN items i ON inv.item_id = i.id
         JOIN children c ON inv.child_id = c.id
         LEFT JOIN child_stats cs ON cs.child_id = c.id
         JOIN users u ON u.family_id = c.family_id AND u.role = 'parent' AND u.line_id IS NOT NULL
         WHERE inv.id = $1`,
        [inventoryId]
      );

      if (notifyRes.rows.length > 0) {
        const firstRow = notifyRes.rows[0];
        const itemInfo = {
          inventoryId: inventoryId,
          name: firstRow.name,
          pointCost: firstRow.point_cost || 0
        };
        const childName = firstRow.child_name;
        const currentPoints = firstRow.current_points || 0;

        const uniqueParentIds = [...new Set(notifyRes.rows.map(r => r.parent_line_id).filter(Boolean))];
        await Promise.all(
          uniqueParentIds.map(lineId =>
            sendRedeemReviewRequest(lineId, itemInfo, childName, currentPoints, reviewToken)
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

      await pool.query('BEGIN');

      // Set status to '已使用'
      await pool.query(
        'UPDATE inventory SET status = \'已使用\' WHERE id = $1',
        [inventoryId]
      );

      // Create redeem log
      await pool.query(
        `INSERT INTO redeem_logs (family_id, card_name, kid_name, date_redeemed, status, reviewer)
         VALUES ($1, $2, $3, CURRENT_DATE, '已核銷', $4)`,
        [familyId, item.name, item.kid_name, `${parentName} (審核)`]
      );

      // Family growth score + 50
      await pool.query(
        'UPDATE families SET growth_score = growth_score + 50 WHERE id = $1',
        [familyId]
      );

      await pool.query('COMMIT');

      return res.json({ message: getMessage('REVIEW_REDEEM_APPROVE_SUCCESS', { name: item.name }) });
    }
  } catch (error) {
    await pool.query('ROLLBACK');
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

    await pool.query('BEGIN');

    if (currentStatus === '未使用') {
      newStatus = '已使用';
      await pool.query(
        "UPDATE inventory SET status = '未使用' WHERE child_id = $1 AND type = '收藏卡' AND status = '已使用'",
        [item.child_id]
      );
    }

    await pool.query(
      'UPDATE inventory SET status = $1 WHERE id = $2',
      [newStatus, inventoryId]
    );

    await pool.query('COMMIT');

    res.json({
      message: newStatus === '已使用' ? '已成功配戴徽章！ | Badge equipped successfully!' : '已成功取下徽章。 | Badge unequipped successfully!',
      status: newStatus
    });
  } catch (error) {
    await pool.query('ROLLBACK');
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

  try {
    await pool.query('BEGIN');

    // 1. Fetch child status
    const childResult = await pool.query(
      'SELECT id, name, tickets, gold FROM children WHERE id = $1',
      [childId]
    );
    if (childResult.rows.length === 0) {
      throw new Error('找不到小孩角色狀態。 | Child profile not found.');
    }
    const child = childResult.rows[0];

    const COST_GOLD = 300;
    if (child.gold < COST_GOLD) {
      throw new Error('金幣不足，無法兌換抽卡券。 | Insufficient gold to buy ticket.');
    }

    const newGold = child.gold - COST_GOLD;
    const newTickets = child.tickets + 1;

    // 2. Update child status in DB
    await pool.query(
      'UPDATE children SET gold = $1, tickets = $2 WHERE id = $3',
      [newGold, newTickets, childId]
    );

    // 3. Write event log for telemetry
    await pool.query(
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

    await pool.query('COMMIT');

    // Fetch updated child profile to send back
    const updatedChildResult = await pool.query(
      'SELECT id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes FROM children WHERE id = $1',
      [childId]
    );

    res.json({
      message: '成功使用 300 金幣兌換 1 張抽卡券！ | Successfully exchanged 300 gold for 1 summon ticket!',
      child: updatedChildResult.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('buyTicketWithGold error:', error);
    res.status(400).json({ message: error.message || '兌換失敗，請稍後再試。' });
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


