import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { getMessage } from '../utils/messageManager.js';

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
    res.status(500).json({ message: getMessage('FETCH_MEMBERS_ERROR') });
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
    res.status(500).json({ message: getMessage('FETCH_CHILDREN_ERROR') });
  }
};

// 3. Add a Child (Parent only)
export const addChild = async (req, res) => {
  const familyId = req.user.family_id;
  const { name, age, birthday, avatar, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: getMessage('ADD_CHILD_REQUIRED_FIELDS') });
  }

  const dbEmail = email.toLowerCase();

  try {
    // Check if email exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [dbEmail]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: getMessage('EMAIL_ALREADY_USED') });
    }

    // Limit maximum child count per family to 8 (consistent with App.jsx)
    const countCheck = await pool.query(
      `SELECT COUNT(c.id) as count FROM children c JOIN users u ON c.user_id = u.id WHERE u.family_id = $1`,
      [familyId]
    );
    if (parseInt(countCheck.rows[0].count, 10) >= 8) {
      return res.status(400).json({ message: getMessage('MAX_CHILDREN_LIMIT') });
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
    const defaultAttributes = JSON.stringify({
      Wisdom: 0,
      Responsibility: 0,
      Courage: 0,
      Empathy: 0,
      Creativity: 0
    });
    const newChild = await pool.query(
      `INSERT INTO children (user_id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes) 
       VALUES ($1, $2, $3, $4, $5, 1, 0, 400, 0, 0, 'Explorer (探索者) ⚔️', $6) RETURNING id`,
      [userId, name, age || 10, birthday || '10/24', avatar || 'boy', defaultAttributes]
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
      message: getMessage('ADD_CHILD_SUCCESS', { name }),
      child: childDetails.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('addChild error:', error);
    res.status(500).json({ message: getMessage('ADD_CHILD_ERROR') });
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
      return res.status(404).json({ message: getMessage('CHILD_NOT_FOUND') });
    }

    const userId = verifyChild.rows[0].user_id;

    // Confirm family has at least 1 child remaining
    const countCheck = await pool.query(
      `SELECT COUNT(c.id) as count FROM children c JOIN users u ON c.user_id = u.id WHERE u.family_id = $1`,
      [familyId]
    );
    if (parseInt(countCheck.rows[0].count, 10) <= 1) {
      return res.status(400).json({ message: getMessage('MIN_CHILDREN_LIMIT') });
    }

    await pool.query('BEGIN');

    // Deleting the user account cascades and deletes the child profile, tasks, and inventory
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    await pool.query('COMMIT');

    res.json({ message: getMessage('DELETE_CHILD_SUCCESS') });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('deleteChild error:', error);
    res.status(500).json({ message: getMessage('DELETE_CHILD_ERROR') });
  }
};

// 5. Update Child Profile Stats (Parent or the Kid themselves)
export const updateChildProfile = async (req, res) => {
  const familyId = req.user.family_id;
  const { childId } = req.params;
  const data = req.body;

  // ── Role-based field restriction ──────────────────────────────────────
  const isKid = req.user.role === 'kid';

  // Kids can only edit cosmetic/display fields on their own profile
  if (isKid) {
    if (String(req.user.child_id) !== String(childId)) {
      return res.status(403).json({ message: '孩子帳號只能修改自己的資料。' });
    }
    // Strip all stat fields — kids cannot self-award gold, level, exp, etc.
    const FORBIDDEN_KID_FIELDS = ['gold', 'tickets', 'level', 'exp', 'exp_needed', 'job_class', 'attributes', 'email', 'password'];
    FORBIDDEN_KID_FIELDS.forEach(f => delete data[f]);
  }
  // ── End Role-based restriction ────────────────────────────────────────

  try {
    // Verify permissions — child must belong to the same family
    const verifyChild = await pool.query(
      `SELECT c.user_id, c.id, u.email 
       FROM children c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1 AND u.family_id = $2`,
      [childId, familyId]
    );

    if (verifyChild.rows.length === 0) {
      return res.status(404).json({ message: getMessage('CHILD_NOT_FOUND') });
    }

    const userId = verifyChild.rows[0].user_id;

    // If updating email, check uniqueness
    if (data.email) {
      const dbEmail = data.email.toLowerCase();
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [dbEmail, userId]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: getMessage('EMAIL_IN_USE') });
      }
    }

    await pool.query('BEGIN');

    // 1. Update Children Stats Table
    const updateChildFields = [];
    const childParams = [];
    let childIndex = 1;

    // Parents can update all stats; kids can only update display fields
    const childAllowedFields = isKid
      ? ['name', 'age', 'birthday', 'avatar']
      : ['name', 'age', 'birthday', 'avatar', 'level', 'exp', 'exp_needed', 'gold', 'tickets', 'job_class', 'attributes'];

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
      message: getMessage('UPDATE_CHILD_SUCCESS'),
      child: updatedStats.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('updateChildProfile error:', error);
    res.status(500).json({ message: getMessage('UPDATE_CHILD_ERROR') });
  }
};

// 6. Add a Parent (Parent only)
export const addParent = async (req, res) => {
  const familyId = req.user.family_id;
  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: getMessage('ADD_PARENT_REQUIRED_FIELDS') });
  }

  const dbEmail = email.toLowerCase();

  try {
    // Check if email exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [dbEmail]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: getMessage('EMAIL_IN_USE') });
    }

    // Limit maximum parent count per family to 8
    const countCheck = await pool.query(
      `SELECT COUNT(id) as count FROM users WHERE family_id = $1 AND role = 'parent'`,
      [familyId]
    );
    if (parseInt(countCheck.rows[0].count, 10) >= 8) {
      return res.status(400).json({ message: getMessage('MAX_PARENTS_LIMIT') });
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
      message: getMessage('ADD_PARENT_SUCCESS', { name }),
      parent: result.rows[0]
    });
  } catch (error) {
    console.error('addParent error:', error);
    res.status(500).json({ message: getMessage('ADD_PARENT_ERROR') });
  }
};

// 7. Delete a Parent (Parent only)
export const deleteParent = async (req, res) => {
  const familyId = req.user.family_id;
  const { parentEmail } = req.params;
  const currentParentEmail = req.user.email;

  if (parentEmail.toLowerCase() === currentParentEmail.toLowerCase()) {
    return res.status(400).json({ message: getMessage('DELETE_SELF_PARENT_ERROR') });
  }

  try {
    // Check if target is a parent in the same family
    const checkTarget = await pool.query(
      'SELECT id, name FROM users WHERE email = $1 AND family_id = $2 AND role = \'parent\'',
      [parentEmail.toLowerCase(), familyId]
    );

    if (checkTarget.rows.length === 0) {
      return res.status(404).json({ message: getMessage('PARENT_NOT_FOUND') });
    }

    // Confirm family has at least 1 parent remaining
    const countCheck = await pool.query(
      `SELECT COUNT(id) as count FROM users WHERE family_id = $1 AND role = 'parent'`,
      [familyId]
    );
    if (parseInt(countCheck.rows[0].count, 10) <= 1) {
      return res.status(400).json({ message: getMessage('MIN_PARENTS_LIMIT') });
    }

    await pool.query('DELETE FROM users WHERE email = $1', [parentEmail.toLowerCase()]);

    res.json({ message: getMessage('DELETE_PARENT_SUCCESS', { name: checkTarget.rows[0].name }) });
  } catch (error) {
    console.error('deleteParent error:', error);
    res.status(500).json({ message: getMessage('DELETE_PARENT_ERROR') });
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
        return res.status(400).json({ message: getMessage('EMAIL_IN_USE') });
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
      return res.status(400).json({ message: getMessage('UPDATE_PARENT_REQUIRED_FIELDS') });
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
      message: getMessage('UPDATE_PARENT_SUCCESS'),
      user: result.rows[0]
    });
  } catch (error) {
    console.error('updateParent error:', error);
    res.status(500).json({ message: getMessage('UPDATE_PARENT_ERROR') });
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
    res.json({ message: getMessage('DESTROY_DATA_SUCCESS') });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('clearAllFamilyData error:', error);
    res.status(500).json({ message: getMessage('DESTROY_DATA_ERROR') });
  }
};
