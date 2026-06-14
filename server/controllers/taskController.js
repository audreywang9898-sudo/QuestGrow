import pool from '../config/db.js';
import { getMessage } from '../utils/messageManager.js';

const determineJobClass = (attrs) => {
  const mapping = {
    Courage: "Explorer (探索者) ⚔️",
    Wisdom: "Sage (智者) 🔮",
    Creativity: "Creator (創造者) 🎨",
    Responsibility: "Guardian (守護者) 🛡️",
    Empathy: "Companion (夥伴者) 🤝"
  };
  let maxAttr = 'Courage';
  let maxVal = -1;
  Object.entries(attrs).forEach(([key, val]) => {
    if (val > maxVal) {
      maxVal = val;
      maxAttr = key;
    }
  });
  return mapping[maxAttr] || "Explorer (探索者) ⚔️";
};

// 1. Get all tasks for the family
export const getTasks = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      `SELECT id, family_id, assigned_to, name, description, type, difficulty, exp_reward, gold_reward, ticket_reward, attribute_reward, period, status, rejection_reason, submission, date_created, created_at
       FROM tasks 
       WHERE family_id = $1 
       ORDER BY created_at DESC`,
      [familyId]
    );
    
    // Map database snake_case structure to frontend camelCase if needed,
    // or just return rows directly. To minimize frontend changes, let's keep keys consistent.
    // Let's return rows, we'll map them in frontend API utility or here.
    // Let's do camelCase mapping here to keep frontend changes minimal!
    const mapped = result.rows.map(row => ({
      id: row.id,
      familyId: row.family_id,
      assignedTo: row.assigned_to,
      name: row.name,
      description: row.description,
      type: row.type,
      difficulty: row.difficulty,
      expReward: row.exp_reward,
      goldReward: row.gold_reward,
      ticketReward: row.ticket_reward,
      attributeReward: row.attribute_reward,
      period: row.period,
      status: row.status,
      rejectionReason: row.rejection_reason,
      submission: row.submission,
      dateCreated: row.date_created ? row.date_created.toISOString().split('T')[0] : null,
      createdAt: row.created_at
    }));

    res.json(mapped);
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ message: getMessage('FETCH_TASKS_ERROR') });
  }
};

// 2. Add Task (Parent only)
export const addTask = async (req, res) => {
  const familyId = req.user.family_id;
  const { 
    name, description, type, difficulty, 
    expReward, goldReward, ticketReward, 
    attributeReward, period, assignedTo, status 
  } = req.body;

  if (!name || !type || !difficulty) {
    return res.status(400).json({ message: getMessage('TASK_REQUIRED_FIELDS') });
  }

  // Permission check: kids can only assign tasks to themselves
  if (req.user.role === 'kid') {
    if (!assignedTo || assignedTo !== req.user.child_id) {
      return res.status(403).json({ message: getMessage('INSUFFICIENT_PERMISSION', { role: 'parent' }) });
    }
  } else if (req.user.role !== 'parent') {
    return res.status(403).json({ message: getMessage('INSUFFICIENT_PERMISSION', { role: 'parent' }) });
  }

  // If assignedTo is 'general' or empty, save as NULL in PostgreSQL
  const dbAssignedTo = (assignedTo === 'general' || !assignedTo) ? null : assignedTo;
  
  // Set initial status: if child is assigned, it starts as '進行中'; else '未指派'
  const initialStatus = status || (dbAssignedTo ? '進行中' : '未指派');

  try {
    const result = await pool.query(
      `INSERT INTO tasks (
         family_id, assigned_to, name, description, type, difficulty, 
         exp_reward, gold_reward, ticket_reward, attribute_reward, period, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        familyId, dbAssignedTo, name, description || '', type, difficulty,
        expReward || 100, goldReward || 50, ticketReward || 1, attributeReward || null,
        period || '每日', initialStatus
      ]
    );

    const row = result.rows[0];
    const createdTask = {
      id: row.id,
      familyId: row.family_id,
      assignedTo: row.assigned_to,
      name: row.name,
      description: row.description,
      type: row.type,
      difficulty: row.difficulty,
      expReward: row.exp_reward,
      goldReward: row.gold_reward,
      ticketReward: row.ticket_reward,
      attributeReward: row.attribute_reward,
      period: row.period,
      status: row.status,
      rejectionReason: row.rejection_reason,
      submission: row.submission,
      dateCreated: row.date_created,
      createdAt: row.created_at
    };

    res.status(201).json({
      message: getMessage('ADD_TASK_SUCCESS', { name }),
      task: createdTask
    });
  } catch (error) {
    console.error('addTask error:', error);
    res.status(500).json({ message: getMessage('CREATE_TASK_ERROR') });
  }
};

// 3. Edit Task
export const editTask = async (req, res) => {
  const familyId = req.user.family_id;
  const { taskId } = req.params;
  const fields = req.body;

  try {
    // Check if task exists and belongs to the family
    const verifyTask = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND family_id = $2',
      [taskId, familyId]
    );
    if (verifyTask.rows.length === 0) {
      return res.status(404).json({ message: getMessage('TASK_NOT_FOUND') });
    }

    const updateFields = [];
    const params = [];
    let index = 1;

    // Database fields mapper (camelCase input -> snake_case db column)
    const fieldMapping = {
      assignedTo: 'assigned_to',
      name: 'name',
      description: 'description',
      type: 'type',
      difficulty: 'difficulty',
      expReward: 'exp_reward',
      goldReward: 'gold_reward',
      ticketReward: 'ticket_reward',
      attributeReward: 'attribute_reward',
      period: 'period',
      status: 'status',
      rejectionReason: 'rejection_reason',
      submission: 'submission'
    };

    Object.entries(fields).forEach(([key, val]) => {
      const dbColumn = fieldMapping[key];
      if (dbColumn) {
        updateFields.push(`${dbColumn} = $${index}`);
        // If assignedTo is 'general', convert to null
        let dbVal = val;
        if (key === 'assignedTo' && val === 'general') dbVal = null;
        else if (key === 'submission') dbVal = JSON.stringify(val);
        
        params.push(dbVal);
        index++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: getMessage('TASK_FIELDS_MISSING') });
    }

    params.push(taskId);
    await pool.query(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${index}`,
      params
    );

    res.json({ message: getMessage('UPDATE_TASK_SUCCESS') });
  } catch (error) {
    console.error('editTask error:', error);
    res.status(500).json({ message: getMessage('UPDATE_TASK_ERROR') });
  }
};

// 4. Delete Task
export const deleteTask = async (req, res) => {
  const familyId = req.user.family_id;
  const { taskId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND family_id = $2 RETURNING name',
      [taskId, familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: getMessage('TASK_NOT_FOUND') });
    }

    res.json({ message: getMessage('DELETE_TASK_SUCCESS', { name: result.rows[0].name }) });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ message: getMessage('DELETE_TASK_ERROR') });
  }
};

// 5. Clear All Tasks
export const clearAllTasks = async (req, res) => {
  const familyId = req.user.family_id;
  const { filter } = req.query; // 'all', 'general', or childId

  try {
    let query = 'DELETE FROM tasks WHERE family_id = $1';
    const params = [familyId];

    if (filter === 'general') {
      query += ' AND assigned_to IS NULL';
    } else if (filter && filter !== 'all') {
      query += ' AND assigned_to = $2';
      params.push(filter);
    }

    await pool.query(query, params);
    res.json({ message: getMessage('CLEAR_TASKS_SUCCESS') });
  } catch (error) {
    console.error('clearAllTasks error:', error);
    res.status(500).json({ message: getMessage('CLEAR_TASKS_ERROR') });
  }
};

// 6. Submit Task for Review (Kid only)
export const submitTask = async (req, res) => {
  const familyId = req.user.family_id;
  const { taskId } = req.params;
  const { notes, photo } = req.body;
  const childId = req.user.child_id;

  if (!childId) {
    return res.status(403).json({ message: getMessage('SUBMIT_TASK_ROLE_ERROR') });
  }

  // Backend validation for photo field
  if (photo && photo !== '') {
    // Must be a valid base64-encoded PNG or JPEG
    const isValidBase64Image = /^data:image\/(png|jpeg|jpg);base64,/.test(photo);
    if (!isValidBase64Image) {
      return res.status(400).json({ message: '不支援的圖片格式，請上傳 PNG 或 JPEG。' });
    }
    // Limit: 5MB image ~ 6.8MB base64 string. Reject anything over 7MB.
    const maxBase64Length = 7 * 1024 * 1024;
    if (photo.length > maxBase64Length) {
      return res.status(400).json({ message: '圖片檔案過大，請限制在 5MB 以內。' });
    }
  }


  try {
    // Verify task belongs to this family
    const verifyTask = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND family_id = $2',
      [taskId, familyId]
    );
    if (verifyTask.rows.length === 0) {
      return res.status(404).json({ message: getMessage('TASK_NOT_FOUND') });
    }

    const submissionData = {
      notes: notes || '',
      photo: photo || '',
      childId: childId
    };

    await pool.query(
      `UPDATE tasks 
       SET status = '待覆核', submission = $1, rejection_reason = NULL 
       WHERE id = $2`,
      [JSON.stringify(submissionData), taskId]
    );

    res.json({ message: getMessage('SUBMIT_TASK_SUCCESS') });
  } catch (error) {
    console.error('submitTask error:', error);
    res.status(500).json({ message: getMessage('SUBMIT_TASK_ERROR') });
  }
};

// 7. Review Task (Parent only: Approve or Reject)
export const reviewTask = async (req, res) => {
  const familyId = req.user.family_id;
  const { taskId } = req.params;
  const { action, reason } = req.body; // action: 'approve' | 'reject'

  if (!action) {
    return res.status(400).json({ message: getMessage('REVIEW_ACTION_MISSING') });
  }

  try {
    // Get task details
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND family_id = $2',
      [taskId, familyId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: getMessage('TASK_NOT_FOUND') });
    }

    const task = taskResult.rows[0];

    if (task.status !== '待覆核') {
      return res.status(400).json({ message: getMessage('REVIEW_TASK_STATUS_INVALID') });
    }

    const childId = task.submission?.childId || task.assigned_to;
    if (!childId) {
      return res.status(400).json({ message: getMessage('CHILD_STATS_NOT_FOUND') });
    }

    if (action === 'reject') {
      // Reject: Return to '進行中' and write reason
      await pool.query(
        `UPDATE tasks 
         SET status = '進行中', rejection_reason = $1 
         WHERE id = $2`,
        [reason || '請重新檢查並修改。', taskId]
      );
      return res.json({ message: getMessage('REJECT_TASK_SUCCESS', { name: task.name }) });
    }

    if (action === 'approve') {
      // Approve: Award EXP, Gold, Tickets, Attributes + Add Family Growth Score
      const difficultyAttrMap = { "簡單": 1, "中等": 2, "較難": 3, "終極": 5 };
      const difficultyFamilyScoreMap = { "簡單": 25, "中等": 50, "較難": 100, "終極": 200 };

      const attrPoints = difficultyAttrMap[task.difficulty] || 1;
      const familyScoreAdd = difficultyFamilyScoreMap[task.difficulty] || 25;

      await pool.query('BEGIN');

      // 1. Fetch child stats
      const childResult = await pool.query(
        'SELECT id, name, level, exp, exp_needed, gold, tickets, attributes FROM children WHERE id = $1',
        [childId]
      );

      if (childResult.rows.length === 0) {
        throw new Error(getMessage('CHILD_STATS_NOT_FOUND'));
      }

      const child = childResult.rows[0];

      // Calculate EXP level-up
      const expReward = task.exp_reward || 100;
      let newExp = child.exp + expReward;
      let newLevel = child.level;
      let expNeeded = child.exp_needed;

      while (newExp >= expNeeded) {
        newExp -= expNeeded;
        newLevel += 1;
        expNeeded = newLevel * 300 + 400;
      }

      // Update Attributes
      const attributes = child.attributes;
      if (task.attribute_reward && attributes[task.attribute_reward] !== undefined) {
        attributes[task.attribute_reward] += attrPoints;
      }

      const jobClass = determineJobClass(attributes);
      const goldReward = task.gold_reward || 50;
      const ticketReward = task.ticket_reward || 1;

      // 2. Update Child
      await pool.query(
        `UPDATE children 
         SET level = $1, exp = $2, exp_needed = $3, gold = gold + $4, tickets = tickets + $5, job_class = $6, attributes = $7 
         WHERE id = $8`,
        [
          newLevel, newExp, expNeeded, 
          goldReward, ticketReward, 
          jobClass, JSON.stringify(attributes), 
          childId
        ]
      );

      // 3. Update Family Score
      await pool.query(
        'UPDATE families SET growth_score = growth_score + $1 WHERE id = $2',
        [familyScoreAdd, familyId]
      );

      // 4. Update Task Status
      await pool.query(
        'UPDATE tasks SET status = \'已完成\' WHERE id = $1',
        [taskId]
      );

      await pool.query('COMMIT');

      // Fetch the updated child details to return
      const updatedChildResult = await pool.query(
        'SELECT id, name, level, exp, exp_needed, gold, tickets, job_class, attributes FROM children WHERE id = $1',
        [childId]
      );

      return res.json({
        message: getMessage('APPROVE_TASK_SUCCESS', { name: task.name }),
        child: updatedChildResult.rows[0],
        familyScoreAdd
      });
    }
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('reviewTask error:', error);
    res.status(500).json({ message: error.message || '伺服器錯誤，審核任務失敗。' });
  }
};
