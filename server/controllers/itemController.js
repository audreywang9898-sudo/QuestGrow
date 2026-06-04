import pool from '../config/db.js';

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
    res.status(500).json({ message: '無法獲取背包道具。' });
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
    res.status(500).json({ message: '無法獲取核銷紀錄。' });
  }
};

// 3. Gacha Draw (Atomic Transaction)
export const drawGachaCard = async (req, res) => {
  const familyId = req.user.family_id;
  const childId = req.user.child_id;
  const { card, costTickets } = req.body;

  if (!childId) {
    return res.status(403).json({ message: '只有小孩帳號可進行召喚抽卡。' });
  }
  if (!card || costTickets === undefined) {
    return res.status(400).json({ message: '請提供卡片資料與抽卡券扣除數量。' });
  }

  try {
    await pool.query('BEGIN');

    // 1. Verify child has enough tickets
    const childResult = await pool.query(
      'SELECT id, name, tickets, gold, level, exp, exp_needed FROM children WHERE id = $1',
      [childId]
    );
    if (childResult.rows.length === 0) {
      throw new Error('找不到此小孩的角色資料。');
    }
    const child = childResult.rows[0];

    if (child.tickets < costTickets) {
      throw new Error('抽卡券不足！');
    }

    // Deduct tickets
    let newTickets = Math.max(0, child.tickets - costTickets);
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

    // 3. For Non-Resource Cards, insert into inventory
    let newItem = null;
    if (card.type !== "資源卡") {
      const expireAt = getExpirationDate(card.rarity);
      const insertResult = await pool.query(
        `INSERT INTO inventory (child_id, card_template_id, name, type, rarity, description, status, expire_at)
         VALUES ($1, $2, $3, $4, $5, $6, '未使用', $7)
         RETURNING id, child_id, card_template_id, name, type, rarity, description, status, date_acquired, expire_at`,
        [childId, card.id, card.name, card.type, card.rarity, card.desc, expireAt]
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
    }

    await pool.query('COMMIT');

    // Get updated child profile to send back
    const updatedChildResult = await pool.query(
      'SELECT id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes FROM children WHERE id = $1',
      [childId]
    );

    res.json({
      message: `召喚成功！獲得 ${card.name}`,
      child: updatedChildResult.rows[0],
      item: newItem
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('drawGachaCard error:', error);
    res.status(500).json({ message: error.message || '伺服器錯誤，召喚失敗。' });
  }
};

// 4. Request Redeem (Kid only)
export const requestRedeem = async (req, res) => {
  const childId = req.user.child_id;
  const { inventoryId } = req.params;

  if (!childId) {
    return res.status(403).json({ message: '只有小孩帳號可以申請使用卡片。' });
  }

  try {
    // Check ownership and status
    const result = await pool.query(
      'SELECT id, name, status, expire_at FROM inventory WHERE id = $1 AND child_id = $2',
      [inventoryId, childId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '找不到此背包卡片。' });
    }

    const item = result.rows[0];

    if (item.status !== '未使用') {
      return res.status(400).json({ message: `卡片目前狀態為「${item.status}」，無法申請使用。` });
    }

    // Check expiration
    if (item.expire_at && new Date(item.expire_at) < new Date()) {
      await pool.query('UPDATE inventory SET status = \'已過期\' WHERE id = $1', [inventoryId]);
      return res.status(400).json({ message: '此卡片已過期，無法申請使用！' });
    }

    await pool.query(
      'UPDATE inventory SET status = \'待核銷\' WHERE id = $1',
      [inventoryId]
    );

    res.json({ message: `已成功申請使用「${item.name}」，等待爸媽確認。` });
  } catch (error) {
    console.error('requestRedeem error:', error);
    res.status(500).json({ message: '伺服器錯誤，申請使用失敗。' });
  }
};

// 5. Review Redeem (Parent only: Approve or Reject)
export const reviewRedeem = async (req, res) => {
  const familyId = req.user.family_id;
  const parentName = req.user.name;
  const { inventoryId } = req.params;
  const { action } = req.body; // 'approve' | 'reject'

  if (!action) {
    return res.status(400).json({ message: '必須提供審核動作（action）。' });
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
      return res.status(404).json({ message: '找不到該申請，或無權限操作。' });
    }

    const item = itemResult.rows[0];

    if (item.status !== '待核銷') {
      return res.status(400).json({ message: '此卡片不處於待核銷狀態。' });
    }

    if (action === 'reject') {
      // Reject: Return to '未使用'
      await pool.query(
        'UPDATE inventory SET status = \'未使用\' WHERE id = $1',
        [inventoryId]
      );
      return res.json({ message: `已駁回「${item.name}」的核銷申請，卡片已退回小孩背包。` });
    }

    if (action === 'approve') {
      // Approve: Check expiration first
      if (item.expire_at && new Date(item.expire_at) < new Date()) {
        await pool.query('UPDATE inventory SET status = \'已過期\' WHERE id = $1', [inventoryId]);
        return res.status(400).json({ message: '審核失敗：此卡片已過期！無法進行核銷。' });
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

      return res.json({ message: `已核准使用「${item.name}」，全家獲得 +50 成長積分！` });
    }
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('reviewRedeem error:', error);
    res.status(500).json({ message: '伺服器錯誤，審核失敗。' });
  }
};
