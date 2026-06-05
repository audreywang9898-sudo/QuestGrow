import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      family_id: user.family_id,
      child_id: user.child_id 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 1. Standard Registration (Register a new Parent + Family)
export const registerParent = async (req, res) => {
  const { email, password, name, avatar } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: '信箱、密碼與姓名為必填項目。' });
  }

  try {
    const dbEmail = email.toLowerCase();
    // Check if email exists
    const userExist = await pool.query('SELECT id FROM users WHERE email = $1', [dbEmail]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: '此電子信箱已被註冊。' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Start Transaction to create Family and User
    await pool.query('BEGIN');

    // Create a new Family
    const familyName = `${name}的家庭`;
    const newFamily = await pool.query(
      'INSERT INTO families (name) VALUES ($1) RETURNING id',
      [familyName]
    );
    const familyId = newFamily.rows[0].id;

    // Create the Parent User
    const newUser = await pool.query(
      `INSERT INTO users (family_id, email, password_hash, name, role, avatar) 
       VALUES ($1, $2, $3, $4, 'parent', $5) RETURNING id, email, name, role, avatar, family_id, child_id`,
      [familyId, dbEmail, passwordHash, name, avatar || 'girl']
    );

    await pool.query('COMMIT');

    const user = newUser.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: '註冊成功！',
      token,
      user
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ message: '伺服器錯誤，註冊失敗。' });
  }
};

// 2. Standard Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '請輸入電子信箱與密碼。' });
  }

  try {
    const dbEmail = email.toLowerCase();
    const result = await pool.query(
      `SELECT u.id, u.family_id, u.email, u.password_hash, u.name, u.role, u.avatar, u.child_id
       FROM users u
       WHERE u.email = $1`,
      [dbEmail]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: '帳號或密碼錯誤。' });
    }

    const user = result.rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: '帳號或密碼錯誤。' });
    }

    // Exclude password_hash from response
    delete user.password_hash;
    const token = generateToken(user);

    res.json({
      message: '登入成功！',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '伺服器錯誤，登入失敗。' });
  }
};

// 3. Google Sign-In / Sign-Up
export const googleLogin = async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: '缺少 Google 登入驗證憑證 (idToken)。' });
  }

  try {
    let email, googleId, name, avatar;

    // Sandbox Mock Bypassing for Local Testing
    if (process.env.NODE_ENV !== 'production' && idToken.startsWith('google-mock-')) {
      email = idToken.replace('google-mock-', '') + '@gmail.com';
      googleId = idToken;
      name = idToken.replace('google-mock-', '').split('@')[0];
      avatar = 'boy';
    } else {
      // Real verification
      try {
        const payload = await verifyGoogleToken(idToken);
        email = payload.email;
        googleId = payload.sub;
        name = payload.name;
        avatar = payload.picture || 'boy';
      } catch (err) {
        console.error('Google token verification failed:', err);
        return res.status(401).json({ message: 'Google 登入憑證無效或已過期。' });
      }
    }

    const dbEmail = email.toLowerCase();
    // 1. Search by Google ID or email
    const findUser = await pool.query(
      'SELECT id, family_id, email, name, role, avatar, google_id, child_id FROM users WHERE google_id = $1 OR email = $2',
      [googleId, dbEmail]
    );

    if (findUser.rows.length > 0) {
      let user = findUser.rows[0];

      // If email matched but google_id wasn't linked, link it now
      if (!user.google_id) {
        const updateResult = await pool.query(
          'UPDATE users SET google_id = $1 WHERE id = $2 RETURNING id, family_id, email, name, role, avatar, child_id',
          [googleId, user.id]
        );
        user = updateResult.rows[0];
      }

      const token = generateToken(user);
      return res.json({
        message: 'Google 登入成功！',
        token,
        user
      });
    }

    // 2. Register a new user with Google login
    const targetRole = role || 'parent';
    const randomPassword = Math.random().toString(36).substring(2, 11);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(randomPassword, salt);

    await pool.query('BEGIN');

    // Create a new Family
    const familyName = `${name}的家庭`;
    const newFamily = await pool.query(
      'INSERT INTO families (name) VALUES ($1) RETURNING id',
      [familyName]
    );
    const familyId = newFamily.rows[0].id;

    // Create Google User
    const newUser = await pool.query(
      `INSERT INTO users (family_id, email, password_hash, name, role, avatar, google_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, family_id, email, name, role, avatar, child_id`,
      [familyId, dbEmail, passwordHash, name, targetRole, avatar, googleId]
    );
    const userId = newUser.rows[0].id;

    let childId = null;
    if (targetRole === 'kid') {
      const newChild = await pool.query(
        `INSERT INTO children (user_id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class) 
         VALUES ($1, $2, 10, '10/24', $3, 1, 0, 400, 100, 1, 'Explorer (探索者) ⚔️') RETURNING id`,
        [userId, name, avatar || 'boy']
      );
      childId = newChild.rows[0].id;
      await pool.query('UPDATE users SET child_id = $1 WHERE id = $2', [childId, userId]);
    }

    await pool.query('COMMIT');

    const user = {
      ...newUser.rows[0],
      child_id: childId
    };
    const token = generateToken(user);

    res.status(201).json({
      message: 'Google 註冊登入成功！',
      token,
      user
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Google login error:', error);
    res.status(500).json({ message: '伺服器錯誤，Google 登入失敗。' });
  }
};

// 4. Link Google Account to Currently Logged-in User
export const linkGoogleAccount = async (req, res) => {
  const { idToken } = req.body;
  const userId = req.user.id;

  if (!idToken) {
    return res.status(400).json({ message: '缺少 Google 驗證憑證 (idToken)。' });
  }

  try {
    let googleId, googleEmail;

    // Sandbox Mock Bypassing for Local Testing
    if (process.env.NODE_ENV !== 'production' && idToken.startsWith('google-mock-')) {
      googleEmail = idToken.replace('google-mock-', '') + '@gmail.com';
      googleId = idToken;
    } else {
      // Real verification
      try {
        const payload = await verifyGoogleToken(idToken);
        googleEmail = payload.email;
        googleId = payload.sub;
      } catch (err) {
        console.error('Google token verification failed:', err);
        return res.status(401).json({ message: 'Google 驗證憑證無效或已過期。' });
      }
    }

    // Check if this googleId is already linked to another account
    const checkLinked = await pool.query(
      'SELECT id FROM users WHERE google_id = $1',
      [googleId]
    );
    if (checkLinked.rows.length > 0) {
      return res.status(400).json({ message: '此 Google 帳戶已被其他 QuestGrow 帳號綁定！' });
    }

    // Link it
    await pool.query(
      'UPDATE users SET google_id = $1 WHERE id = $2',
      [googleId, userId]
    );

    res.json({ message: '成功連結 Google 帳戶！今後可使用 Google 快速登入。' });
  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({ message: '伺服器錯誤，綁定 Google 帳戶失敗。' });
  }
};

// 5. Get Public Auth Configuration
export const getAuthConfig = async (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ""
  });
};
