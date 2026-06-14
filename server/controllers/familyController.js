import pool from '../config/db.js';
import { getMessage } from '../utils/messageManager.js';
import { validateTextField, safeErrorMessage } from '../utils/validation.js';

// 1. Get Family Info (Name, Growth Score)
export const getFamilyData = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      'SELECT id, name, growth_score FROM families WHERE id = $1',
      [familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: getMessage('FAMILY_NOT_FOUND') });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      growthScore: row.growth_score
    });
  } catch (error) {
    console.error('getFamilyData error:', error);
    res.status(500).json({ message: getMessage('FETCH_FAMILY_ERROR') });
  }
};

// 2. Get Wishlist
export const getWishlist = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      'SELECT id, title, points_needed, points_current, is_ultimate, is_redeemed FROM wishlist WHERE family_id = $1 ORDER BY created_at ASC',
      [familyId]
    );

    const mapped = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      pointsNeeded: row.points_needed,
      pointsCurrent: row.points_current,
      isUltimate: row.is_ultimate,
      isRedeemed: row.is_redeemed
    }));

    res.json(mapped);
  } catch (error) {
    console.error('getWishlist error:', error);
    res.status(500).json({ message: getMessage('FETCH_WISHLIST_ERROR') });
  }
};

// 3. Add Wishlist Item
export const addWishlistItem = async (req, res) => {
  const familyId = req.user.family_id;
  const { title, pointsNeeded } = req.body;

  if (!title || pointsNeeded === undefined) {
    return res.status(400).json({ message: getMessage('WISHLIST_REQUIRED_FIELDS') });
  }

  // Length validation
  const titleErr = validateTextField(title, '願望標題', { required: true, maxLength: 100 });
  if (titleErr) return res.status(400).json({ message: titleErr });

  try {
    const result = await pool.query(
      `INSERT INTO wishlist (family_id, title, points_needed, is_ultimate, is_redeemed)
       VALUES ($1, $2, $3, false, false)
       RETURNING id, title, points_needed, points_current, is_ultimate, is_redeemed`,
      [familyId, title, pointsNeeded]
    );

    const row = result.rows[0];
    res.status(201).json({
      message: getMessage('ADD_WISH_SUCCESS', { title }),
      item: {
        id: row.id,
        title: row.title,
        pointsNeeded: row.points_needed,
        pointsCurrent: row.points_current,
        isUltimate: row.is_ultimate,
        isRedeemed: row.is_redeemed
      }
    });
  } catch (error) {
    console.error('addWishlistItem error:', error);
    res.status(500).json({ message: getMessage('CREATE_WISH_ERROR') });
  }
};

// 4. Edit Wishlist Item
export const editWishlistItem = async (req, res) => {
  const familyId = req.user.family_id;
  const { id } = req.params;
  const { title, pointsNeeded } = req.body;

  try {
    const checkItem = await pool.query('SELECT id FROM wishlist WHERE id = $1 AND family_id = $2', [id, familyId]);
    if (checkItem.rows.length === 0) {
      return res.status(404).json({ message: getMessage('WISH_NOT_FOUND') });
    }

    await pool.query(
      'UPDATE wishlist SET title = $1, points_needed = $2 WHERE id = $3',
      [title, pointsNeeded, id]
    );

    res.json({ message: getMessage('UPDATE_WISH_SUCCESS') });
  } catch (error) {
    console.error('editWishlistItem error:', error);
    res.status(500).json({ message: getMessage('UPDATE_WISH_ERROR') });
  }
};

// 5. Delete Wishlist Item
export const deleteWishlistItem = async (req, res) => {
  const familyId = req.user.family_id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE id = $1 AND family_id = $2 RETURNING title',
      [id, familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: getMessage('DELETE_WISH_PERMISSION_ERROR') });
    }

    res.json({ message: getMessage('DELETE_WISH_SUCCESS') });
  } catch (error) {
    console.error('deleteWishlistItem error:', error);
    res.status(500).json({ message: getMessage('DELETE_WISH_ERROR') });
  }
};

// 6. Redeem Wishlist Item (Deducts score)
export const redeemWishlist = async (req, res) => {
  const familyId = req.user.family_id;
  const { id } = req.params;

  try {
    await pool.query('BEGIN');

    // Fetch family score and wishlist cost
    const familyResult = await pool.query('SELECT growth_score FROM families WHERE id = $1', [familyId]);
    const wishResult = await pool.query('SELECT points_needed, is_redeemed, title FROM wishlist WHERE id = $1 AND family_id = $2', [id, familyId]);

    if (familyResult.rows.length === 0 || wishResult.rows.length === 0) {
      throw new Error('找不到對應的家庭或願望項目。');
    }

    const family = familyResult.rows[0];
    const wish = wishResult.rows[0];

    if (wish.is_redeemed) {
      throw new Error('此願望已兌換過。');
    }

    if (family.growth_score < wish.points_needed) {
      throw new Error('家庭積分不足！無法兌換。');
    }

    // Deduct points from family
    await pool.query(
      'UPDATE families SET growth_score = growth_score - $1 WHERE id = $2',
      [wish.points_needed, familyId]
    );

    // Set wishlist to redeemed
    await pool.query(
      'UPDATE wishlist SET is_redeemed = true WHERE id = $1',
      [id]
    );

    await pool.query('COMMIT');
    res.json({ message: getMessage('REDEEM_WISH_SUCCESS', { title: wish.title }) });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('redeemWishlist error:', error);
    res.status(500).json({ message: safeErrorMessage(error, getMessage('REDEEM_WISH_ERROR')) });
  }
};

// 7. Get Parent Goals
export const getParentGoals = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      'SELECT id, category, title, progress, status FROM parent_goals WHERE family_id = $1 ORDER BY created_at ASC',
      [familyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getParentGoals error:', error);
    res.status(500).json({ message: getMessage('FETCH_PARENT_GOALS_ERROR') });
  }
};

// 8. Add Parent Goal
export const addParentGoal = async (req, res) => {
  const familyId = req.user.family_id;
  const { category, title } = req.body;

  if (!category || !title) {
    return res.status(400).json({ message: getMessage('GOAL_REQUIRED_FIELDS') });
  }

  // Length validation
  const goalTitleErr = validateTextField(title, '目標標題', { required: true, maxLength: 100 });
  if (goalTitleErr) return res.status(400).json({ message: goalTitleErr });

  try {
    const result = await pool.query(
      `INSERT INTO parent_goals (family_id, category, title, progress, status)
       VALUES ($1, $2, $3, 0, '進行中')
       RETURNING id, category, title, progress, status`,
      [familyId, category, title]
    );

    res.status(201).json({
      message: getMessage('ADD_GOAL_SUCCESS', { title }),
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('addParentGoal error:', error);
    res.status(500).json({ message: getMessage('CREATE_GOAL_ERROR') });
  }
};

// 9. Update Goal Progress (Awards Score: diff * 2)
export const updateGoalProgress = async (req, res) => {
  const familyId = req.user.family_id;
  const { id } = req.params;
  const { progress } = req.body;

  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json({ message: getMessage('GOAL_PROGRESS_INVALID') });
  }

  try {
    await pool.query('BEGIN');

    // Fetch existing progress
    const goalResult = await pool.query(
      'SELECT progress, title FROM parent_goals WHERE id = $1 AND family_id = $2',
      [id, familyId]
    );

    if (goalResult.rows.length === 0) {
      throw new Error('找不到該家長目標。');
    }

    const goal = goalResult.rows[0];
    const prevProgress = goal.progress;
    const newStatus = progress >= 100 ? '已達成' : '進行中';

    // Update goal
    await pool.query(
      'UPDATE parent_goals SET progress = $1, status = $2 WHERE id = $3',
      [progress, newStatus, id]
    );

    // Calculate score points (diff * 2)
    if (progress > prevProgress) {
      const diff = progress - prevProgress;
      const scoreAdd = Math.round(diff * 2);

      await pool.query(
        'UPDATE families SET growth_score = growth_score + $1 WHERE id = $2',
        [scoreAdd, familyId]
      );
    }

    await pool.query('COMMIT');
    res.json({ message: getMessage('UPDATE_GOAL_SUCCESS') });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('updateGoalProgress error:', error);
    res.status(500).json({ message: safeErrorMessage(error, getMessage('UPDATE_GOAL_ERROR')) });
  }
};

// 10. Delete Parent Goal
export const deleteParentGoal = async (req, res) => {
  const familyId = req.user.family_id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM parent_goals WHERE id = $1 AND family_id = $2 RETURNING title',
      [id, familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: getMessage('DELETE_GOAL_PERMISSION_ERROR') });
    }

    res.json({ message: getMessage('DELETE_GOAL_SUCCESS') });
  } catch (error) {
    console.error('deleteParentGoal error:', error);
    res.status(500).json({ message: getMessage('DELETE_GOAL_ERROR') });
  }
};

// 11. Get Weekly Competition Summary
export const getWeeklyComp = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      `SELECT week_range, champions, mvp_task, devil_task, family_title
       FROM weekly_competition
       WHERE family_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [familyId]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const row = result.rows[0];
    res.json({
      weekRange: row.week_range,
      champions: row.champions,
      mvpTask: row.mvp_task,
      devilTask: row.devil_task,
      familyTitle: row.family_title
    });
  } catch (error) {
    console.error('getWeeklyComp error:', error);
    res.status(500).json({ message: getMessage('FETCH_WEEKLY_REPORT_ERROR') });
  }
};

// 12. Get Event Logs (Limit to 100)
export const getEventLogs = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      `SELECT id, user_id, event_type, metadata, timestamp
       FROM event_logs
       WHERE family_id = $1
       ORDER BY timestamp DESC
       LIMIT 100`,
      [familyId]
    );

    const mapped = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      eventType: row.event_type,
      timestamp: row.timestamp,
      metadata: row.metadata
    }));

    res.json(mapped);
  } catch (error) {
    console.error('getEventLogs error:', error);
    res.status(500).json({ message: getMessage('FETCH_EVENT_LOGS_ERROR') });
  }
};

// 13. Add Event Log
export const addEventLog = async (req, res) => {
  const familyId = req.user.family_id;
  const userId = req.user.id;
  const { eventType, metadata } = req.body;

  if (!eventType) {
    return res.status(400).json({ message: getMessage('EVENT_TYPE_REQUIRED') });
  }

  try {
    await pool.query(
      `INSERT INTO event_logs (family_id, user_id, event_type, metadata)
       VALUES ($1, $2, $3, $4)`,
      [familyId, userId, eventType, JSON.stringify(metadata || {})]
    );
    res.status(201).json({ message: getMessage('EVENT_LOGGED_SUCCESS') });
  } catch (error) {
    console.error('addEventLog error:', error);
    res.status(500).json({ message: getMessage('EVENT_LOG_ERROR') });
  }
};
