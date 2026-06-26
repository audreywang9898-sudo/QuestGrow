import pool from '../config/db.js';

// 1. Submit feedback (Public or Optional Auth)
export const submitFeedback = async (req, res) => {
  const { name, email, category, content } = req.body;
  
  if (!category || !content) {
    return res.status(400).json({ message: '類別與內容為必填欄位。' });
  }

  try {
    let familyId = null;
    let userId = null;
    let finalName = name;
    let finalEmail = email;

    // If request has authenticated user details
    if (req.user) {
      userId = req.user.id;
      familyId = req.user.family_id || req.user.familyId;
      
      // Fetch user name and email from DB if not provided
      if (!finalName || !finalEmail) {
        const userRes = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length > 0) {
          finalName = finalName || userRes.rows[0].name;
          finalEmail = finalEmail || userRes.rows[0].email;
        }
      }
    }

    if (!finalName || !finalEmail) {
      return res.status(400).json({ message: '未登入狀態下，姓名與信箱為必填欄位。' });
    }

    const result = await pool.query(
      `INSERT INTO feedbacks (family_id, user_id, name, email, category, content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, category, content, status, created_at AS "createdAt"`,
      [familyId, userId, finalName, finalEmail, category, content]
    );

    res.status(201).json({
      message: '意見回饋已成功提交，非常感謝您的寶貴意見！',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ message: '提交意見回饋失敗，請稍後再試。' });
  }
};

// 2. Get all feedbacks (Admin only)
export const getFeedbacks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         f.id,
         f.family_id AS "familyId",
         f.user_id AS "userId",
         f.name,
         f.email,
         f.category,
         f.content,
         f.status,
         f.created_at AS "createdAt",
         fam.name AS "familyName"
       FROM feedbacks f
       LEFT JOIN families fam ON f.family_id = fam.id
       ORDER BY f.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getFeedbacks error:', error);
    res.status(500).json({ message: '無法取得意見回饋列表。' });
  }
};

// 3. Update feedback status (Admin only)
export const updateFeedbackStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['待處理', '處理中', '已解決'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: '無效的處理狀態。' });
  }

  try {
    const result = await pool.query(
      `UPDATE feedbacks 
       SET status = $1 
       WHERE id = $2 
       RETURNING id, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '找不到該筆意見回饋。' });
    }

    res.json({
      message: '回饋狀態更新成功。',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('updateFeedbackStatus error:', error);
    res.status(500).json({ message: '更新回饋狀態失敗。' });
  }
};

// 4. Delete feedback (Admin only)
export const deleteFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM feedbacks WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '找不到該筆意見回饋。' });
    }
    res.json({ message: '意見回饋已成功刪除。' });
  } catch (error) {
    console.error('deleteFeedback error:', error);
    res.status(500).json({ message: '刪除意見回饋失敗。' });
  }
};
