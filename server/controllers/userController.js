import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// 1. Get all users in the family
export const getFamilyUsers = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      `SELECT id, email, name, role, avatar, child_id, google_id, created_at 
       FROM users 
       WHERE family_id = $1`,
      [familyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getFamilyUsers error:', error);
    res.status(500).json({ message: '無法獲取家庭成員資料。' });
  }
};

// 2. Get all children profiles in the family
export const getChildren = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    const result = await pool.query(
      `SELECT c.id, c.user_id, c.name, c.age, c.birthday, c.avatar, c.level, c.exp, c.exp_needed, c.gold, c.tickets, c.job_class, c.attributes
       FROM children c
       JOIN users u ON c.user_id = u.id
       WHERE u.family_id = $1`,
      [familyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getChildren error:', error);
    res.status(500).json({ message: '無法獲取小孩角色資料。' });
  }
};

// 3. Add a Child (Parent only)
export const addChild = async (req, res) => {
  const familyId = req.user.family_id;
  const { name, age, birthday, avatar, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: '姓名、信箱與密碼為必填項目。' });
  }

  const dbEmail = email.toLowerCase();

  try {
    // Check if email exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [dbEmail]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: '此電子信箱已被其他帳號使用。' });
    }

    // Limit maximum child count per family to 8 (consistent with App.jsx)
    const countCheck = await pool.query(
      `SELECT COUNT(c.id) as count FROM children c JOIN users u ON c.user_id = u.id WHERE u.family_id = $1`,
      [familyId]
    );
    if (parseInt(countCheck.rows[0].count, 10) >= 8) {
      return res.status(400).json({ message: '最多只能新增 8 位小孩。' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    await pool.query('BEGIN');

    // Create the Kid User
    const newUser = await pool.query(
      `INSERT INTO users (family_id, email, password_hash, name, role, avatar) 
       VALUES ($1, $2, $3, $4, 'kid', $5) RETURNING id`,
      [familyId, dbEmail, passwordHash, name, avatar || 'boy']
    );
    const userId = newUser.rows[0].id;

    // Create the Child Character Stats
    const newChild = await pool.query(
      `INSERT INTO children (user_id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class) 
       VALUES ($1, $2, $3, $4, $5, 1, 0, 400, 100, 1, 'Explorer (探索者) ⚔️') RETURNING id`,
      [userId, name, age || 10, birthday || '10/24', avatar || 'boy']
    );
    const childId = newChild.rows[0].id;

    // Update user's backreference child_id
    await pool.query('UPDATE users SET child_id = $1 WHERE id = $2', [childId, userId]);

    await pool.query('COMMIT');

    // Return the created child details
    const childDetails = await pool.query(
      'SELECT id, user_id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes FROM children WHERE id = $1',
      [childId]
    );

    res.status(201).json({
      message: `成功新增冒險者「${name}」！`,
      child: childDetails.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('addChild error:', error);
    res.status(500).json({ message: '伺服器錯誤，新增小孩失敗。' });
  }
};

// 4. Delete a Child (Parent only)
export const deleteChild = async (req, res) => {
  const familyId = req.user.family_id;
  const { childId } = req.params;

  try {
    // Check if child belongs to the family
    const verifyChild = await pool.query(
      `SELECT c.user_id 
       FROM children c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1 AND u.family_id = $2`,
      [childId, familyId]
    );

    if (verifyChild.rows.length === 0) {
      return res.status(404).json({ message: '找不到該小孩資料，或無權限操作。' });
    }

    const userId = verifyChild.rows[0].user_id;

    // Confirm family has at least 1 child remaining
    const countCheck = await pool.query(
      `SELECT COUNT(c.id) as count FROM children c JOIN users u ON c.user_id = u.id WHERE u.family_id = $1`,
      [familyId]
    );
    if (parseInt(countCheck.rows[0].count, 10) <= 1) {
      return res.status(400).json({ message: '至少需要保留 1 位小孩，無法全部刪除。' });
    }

    await pool.query('BEGIN');
    
    // Deleting the user account cascades and deletes the child profile, tasks, and inventory
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    await pool.query('COMMIT');

    res.json({ message: '已成功刪除該小孩的角色與帳號資料。' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('deleteChild error:', error);
    res.status(500).json({ message: '伺服器錯誤，刪除失敗。' });
  }
};

// 5. Update Child Profile Stats (Parent or the Kid themselves)
export const updateChildProfile = async (req, res) => {
  const familyId = req.user.family_id;
  const { childId } = req.params;
  const data = req.body; // attributes, gold, level, name, avatar, etc.

  try {
    // Verify permissions
    const verifyChild = await pool.query(
      `SELECT c.user_id, c.id, u.email 
       FROM children c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1 AND u.family_id = $2`,
      [childId, familyId]
    );

    if (verifyChild.rows.length === 0) {
      return res.status(404).json({ message: '找不到該小孩資料，或無權限操作。' });
    }

    const userId = verifyChild.rows[0].user_id;

    // If updating email, check uniqueness
    if (data.email) {
      const dbEmail = data.email.toLowerCase();
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [dbEmail, userId]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: '此電子信箱已被使用。' });
      }
    }

    await pool.query('BEGIN');

    // 1. Update Children Stats Table
    const updateChildFields = [];
    const childParams = [];
    let childIndex = 1;

    const childAllowedFields = ['name', 'age', 'birthday', 'avatar', 'level', 'exp', 'exp_needed', 'gold', 'tickets', 'job_class', 'attributes'];
    childAllowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateChildFields.push(`${field} = $${childIndex}`);
        childParams.push(field === 'attributes' ? JSON.stringify(data[field]) : data[field]);
        childIndex++;
      }
    });

    if (updateChildFields.length > 0) {
      childParams.push(childId);
      await pool.query(
        `UPDATE children SET ${updateChildFields.join(', ')} WHERE id = $${childIndex}`,
        childParams
      );
    }

    // 2. Update User Account Table (e.g. name, avatar, email, password)
    const updateUserFields = [];
    const userParams = [];
    let userIndex = 1;

    if (data.name) {
      updateUserFields.push(`name = $${userIndex}`);
      userParams.push(data.name);
      userIndex++;
    }
    if (data.avatar) {
      updateUserFields.push(`avatar = $${userIndex}`);
      userParams.push(data.avatar);
      userIndex++;
    }
    if (data.email) {
      updateUserFields.push(`email = $${userIndex}`);
      userParams.push(data.email.toLowerCase());
      userIndex++;
    }
    if (data.password) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(data.password, salt);
      updateUserFields.push(`password_hash = $${userIndex}`);
      userParams.push(passwordHash);
      userIndex++;
    }

    if (updateUserFields.length > 0) {
      userParams.push(userId);
      await pool.query(
        `UPDATE users SET ${updateUserFields.join(', ')} WHERE id = $${userIndex}`,
        userParams
      );
    }

    await pool.query('COMMIT');

    // Get updated child stats
    const updatedStats = await pool.query(
      'SELECT id, user_id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes FROM children WHERE id = $1',
      [childId]
    );

    res.json({
      message: '角色資料更新成功！',
      child: updatedStats.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('updateChildProfile error:', error);
    res.status(500).json({ message: '伺服器錯誤，更新失敗。' });
  }
};

// 6. Add a Parent (Parent only)
export const addParent = async (req, res) => {
  const familyId = req.user.family_id;
  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: '姓名、信箱與密碼為必填項目。' });
  }

  const dbEmail = email.toLowerCase();

  try {
    // Check if email exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [dbEmail]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: '此電子信箱已被使用。' });
    }

    // Limit maximum parent count per family to 8
    const countCheck = await pool.query(
      `SELECT COUNT(id) as count FROM users WHERE family_id = $1 AND role = 'parent'`,
      [familyId]
    );
    if (parseInt(countCheck.rows[0].count, 10) >= 8) {
      return res.status(400).json({ message: '最多只能新增 8 位家長。' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const result = await pool.query(
      `INSERT INTO users (family_id, email, password_hash, name, role, avatar) 
       VALUES ($1, $2, $3, $4, 'parent', $5) RETURNING id, email, name, role, avatar`,
      [familyId, dbEmail, passwordHash, name, avatar || 'girl']
    );

    res.status(201).json({
      message: `成功新增家長「${name}」！`,
      parent: result.rows[0]
    });
  } catch (error) {
    console.error('addParent error:', error);
    res.status(500).json({ message: '伺服器錯誤，新增家長失敗。' });
  }
};

// 7. Delete a Parent (Parent only)
export const deleteParent = async (req, res) => {
  const familyId = req.user.family_id;
  const { parentEmail } = req.params;
  const currentParentEmail = req.user.email;

  if (parentEmail.toLowerCase() === currentParentEmail.toLowerCase()) {
    return res.status(400).json({ message: '您不能刪除目前正在登入的家長帳號！' });
  }

  try {
    // Check if target is a parent in the same family
    const checkTarget = await pool.query(
      'SELECT id, name FROM users WHERE email = $1 AND family_id = $2 AND role = \'parent\'',
      [parentEmail.toLowerCase(), familyId]
    );

    if (checkTarget.rows.length === 0) {
      return res.status(404).json({ message: '找不到該家長資料，或無權限操作。' });
    }

    // Confirm family has at least 1 parent remaining
    const countCheck = await pool.query(
      `SELECT COUNT(id) as count FROM users WHERE family_id = $1 AND role = 'parent'`,
      [familyId]
    );
    if (parseInt(countCheck.rows[0].count, 10) <= 1) {
      return res.status(400).json({ message: '至少需要保留 1 位家長。' });
    }

    await pool.query('DELETE FROM users WHERE email = $1', [parentEmail.toLowerCase()]);

    res.json({ message: `已成功刪除家長「${checkTarget.rows[0].name}」的帳號。` });
  } catch (error) {
    console.error('deleteParent error:', error);
    res.status(500).json({ message: '伺服器錯誤，刪除家長失敗。' });
  }
};

// 8. Update Parent Profile (Parent themselves)
export const updateParent = async (req, res) => {
  const userId = req.user.id;
  const { name, email, password, avatar } = req.body;

  try {
    // If updating email, check uniqueness
    if (email) {
      const dbEmail = email.toLowerCase();
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [dbEmail, userId]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: '此電子信箱已被使用。' });
      }
    }

    const updateFields = [];
    const params = [];
    let index = 1;

    if (name) {
      updateFields.push(`name = $${index}`);
      params.push(name);
      index++;
    }
    if (avatar) {
      updateFields.push(`avatar = $${index}`);
      params.push(avatar);
      index++;
    }
    if (email) {
      updateFields.push(`email = $${index}`);
      params.push(email.toLowerCase());
      index++;
    }
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      updateFields.push(`password_hash = $${index}`);
      params.push(passwordHash);
      index++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '未提供更新欄位。' });
    }

    params.push(userId);
    const result = await pool.query(
      `UPDATE users 
       SET ${updateFields.join(', ')} 
       WHERE id = $${index} 
       RETURNING id, email, name, role, avatar`,
      params
    );

    res.json({
      message: '家長個人資料更新成功！',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('updateParent error:', error);
    res.status(500).json({ message: '伺服器錯誤，更新失敗。' });
  }
};

// 9. Hard GDPR/COPPA Deletion of all Family Data (Parent only)
export const clearAllFamilyData = async (req, res) => {
  const familyId = req.user.family_id;

  try {
    await pool.query('BEGIN');
    
    // Clear all associated users, children, tasks, etc. by deleting the family entry
    await pool.query('DELETE FROM families WHERE id = $1', [familyId]);

    await pool.query('COMMIT');
    res.json({ message: '隱私保護安全：所有家庭與兒童個資已從資料庫完全銷毀！' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('clearAllFamilyData error:', error);
    res.status(500).json({ message: '無法銷毀家庭數據。' });
  }
};
