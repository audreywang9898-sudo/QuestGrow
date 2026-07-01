import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { getMessage } from '../utils/messageManager.js';

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

const checkFirstLoginAndNotify = async (userId) => {
  try {
    const userRes = await pool.query(
      'SELECT id, name, email, role, login_count FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) return;
    const user = userRes.rows[0];
    
    if ((user.login_count === 0 || user.login_count === null) && user.role !== 'admin') {
      const title = '🔔 新使用者首次登入';
      const message = `新會員 ${user.name} (${user.email}) 角色：${user.role} 首次登入系統！`;
      await pool.query(
        'INSERT INTO admin_notifications (user_id, title, message) VALUES ($1, $2, $3)',
        [user.id, title, message]
      );
    }
    
    await pool.query(
      'UPDATE users SET login_count = COALESCE(login_count, 0) + 1 WHERE id = $1',
      [userId]
    );
  } catch (err) {
    console.error('Error in checkFirstLoginAndNotify:', err);
  }
};

// 1. Standard Registration (Register a new Parent + Family)
export const registerParent = async (req, res) => {
  const { email, password, name, avatar } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: getMessage('REGISTRATION_REQUIRED_FIELDS') });
  }

  try {
    const dbEmail = email.toLowerCase();
    // Check if email exists
    const userExist = await pool.query('SELECT id FROM users WHERE email = $1', [dbEmail]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: getMessage('EMAIL_ALREADY_REGISTERED') });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const client = await pool.connect();
    let user;
    try {
      await client.query('BEGIN');

      // Create a new Family
      const familyName = `${name}的家庭`;
      const newFamily = await client.query(
        'INSERT INTO families (name) VALUES ($1) RETURNING id',
        [familyName]
      );
      const familyId = newFamily.rows[0].id;

      // Create the Parent Parent User
      const newUser = await client.query(
        `INSERT INTO users (family_id, email, password_hash, name, role, avatar) 
         VALUES ($1, $2, $3, $4, 'parent', $5) RETURNING id, email, name, role, avatar, family_id, child_id, onboarding_completed, google_id, line_id`,
        [familyId, dbEmail, passwordHash, name, avatar || 'girl']
      );

      await client.query('COMMIT');
      user = newUser.rows[0];
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }

    user.childId = user.child_id;
    user.onboardingCompleted = user.onboarding_completed;
    user.googleId = user.google_id;
    const token = generateToken(user);

    await checkFirstLoginAndNotify(user.id);

    res.status(201).json({
      message: getMessage('REGISTRATION_SUCCESS'),
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: getMessage('REGISTRATION_ERROR') });
  }
};

// 2. Standard Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: getMessage('LOGIN_REQUIRED_FIELDS') });
  }

  try {
    const dbEmail = email.toLowerCase();
    const result = await pool.query(
      `SELECT u.id, u.family_id, u.email, u.password_hash, u.name, u.role, u.avatar, u.child_id, u.onboarding_completed, u.google_id, u.line_id
       FROM users u
       WHERE u.email = $1`,
      [dbEmail]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: getMessage('INVALID_CREDENTIALS') });
    }

    const user = result.rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: getMessage('INVALID_CREDENTIALS') });
    }

    // Exclude password_hash from response
    delete user.password_hash;
    user.childId = user.child_id;
    user.onboardingCompleted = user.onboarding_completed;
    user.googleId = user.google_id;
    const token = generateToken(user);

    await checkFirstLoginAndNotify(user.id);

    res.json({
      message: getMessage('LOGIN_SUCCESS'),
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: getMessage('LOGIN_ERROR') });
  }
};

// 3. Google Sign-In / Sign-Up
export const googleLogin = async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: getMessage('GOOGLE_TOKEN_MISSING') });
  }

  try {
    let email, googleId, name, avatar;

    // Sandbox Mock Bypass — ONLY when ALLOW_GOOGLE_MOCK=true is explicitly set.
    // This env var must NEVER be set in production. NODE_ENV alone is not a reliable gate.
    const isMockAllowed = process.env.ALLOW_GOOGLE_MOCK === 'true';
    if (isMockAllowed && idToken.startsWith('google-mock-')) {
      // Allowlist: only specific test account names are permitted
      const ALLOWED_MOCK_ACCOUNTS = (process.env.GOOGLE_MOCK_ACCOUNTS || 'testuser').split(',').map(s => s.trim());
      const mockName = idToken.replace('google-mock-', '');
      if (!ALLOWED_MOCK_ACCOUNTS.includes(mockName)) {
        return res.status(401).json({ message: getMessage('GOOGLE_TOKEN_INVALID') });
      }
      email = mockName + '@gmail.com';
      googleId = idToken;
      name = mockName;
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
        return res.status(401).json({ message: getMessage('GOOGLE_TOKEN_INVALID') });
      }
    }

    const dbEmail = email.toLowerCase();
    // 1. Search by Google ID or email
    const findUser = await pool.query(
      'SELECT id, family_id, email, name, role, avatar, google_id, line_id, child_id, onboarding_completed FROM users WHERE google_id = $1 OR email = $2',
      [googleId, dbEmail]
    );

    if (findUser.rows.length > 0) {
      let user = findUser.rows[0];

      // If email matched but google_id wasn't linked, link it now
      if (!user.google_id) {
        const updateResult = await pool.query(
          'UPDATE users SET google_id = $1 WHERE id = $2 RETURNING id, family_id, email, name, role, avatar, google_id, line_id, child_id, onboarding_completed',
          [googleId, user.id]
        );
        user = updateResult.rows[0];
      }

      user.childId = user.child_id;
      user.onboardingCompleted = user.onboarding_completed;
      user.googleId = user.google_id;
      const token = generateToken(user);

      await checkFirstLoginAndNotify(user.id);

      return res.json({
        message: getMessage('GOOGLE_LOGIN_SUCCESS'),
        token,
        user
      });
    }

    // 2. Register a new user with Google login
    // Whitelist roles: frontend cannot inject 'admin' or other elevated roles.
    const ALLOWED_ROLES = ['parent', 'kid'];
    const targetRole = ALLOWED_ROLES.includes(role) ? role : 'parent';
    const randomPassword = Math.random().toString(36).substring(2, 11);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(randomPassword, salt);

    const client = await pool.connect();
    let newUserRow, childId = null;
    try {
      await client.query('BEGIN');

      // Create a new Family
      const familyName = `${name}的家庭`;
      const newFamily = await client.query(
        'INSERT INTO families (name) VALUES ($1) RETURNING id',
        [familyName]
      );
      const familyId = newFamily.rows[0].id;

      // Create Google User
      const newUser = await client.query(
        `INSERT INTO users (family_id, email, password_hash, name, role, avatar, google_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, family_id, email, name, role, avatar, google_id, line_id, child_id, onboarding_completed`,
        [familyId, dbEmail, passwordHash, name, targetRole, avatar, googleId]
      );
      newUserRow = newUser.rows[0];
      const userId = newUserRow.id;

      if (targetRole === 'kid') {
        const newChild = await client.query(
          `INSERT INTO children (user_id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class) 
           VALUES ($1, $2, 10, '10/24', $3, 1, 0, 400, 0, 0, 'Explorer (探索者) ⚔️') RETURNING id`,
          [userId, name, avatar || 'boy']
        );
        childId = newChild.rows[0].id;
        await client.query('UPDATE users SET child_id = $1 WHERE id = $2', [childId, userId]);
      }

      await client.query('COMMIT');
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }

    const user = {
      ...newUserRow,
      child_id: childId,
      childId: childId,
      onboardingCompleted: newUserRow.onboarding_completed,
      googleId: newUserRow.google_id
    };
    const token = generateToken(user);

    await checkFirstLoginAndNotify(user.id);

    res.status(201).json({
      message: getMessage('GOOGLE_REG_LOGIN_SUCCESS'),
      token,
      user
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: getMessage('GOOGLE_LOGIN_ERROR') });
  }
};

// 4. Link Google Account to Currently Logged-in User
export const linkGoogleAccount = async (req, res) => {
  const { idToken } = req.body;
  const userId = req.user.id;

  if (!idToken) {
    return res.status(400).json({ message: getMessage('LINK_GOOGLE_TOKEN_MISSING') });
  }

  try {
    let googleId, googleEmail;

    // Sandbox Mock Bypass — ONLY when ALLOW_GOOGLE_MOCK=true is explicitly set.
    const isMockAllowed = process.env.ALLOW_GOOGLE_MOCK === 'true';
    if (isMockAllowed && idToken.startsWith('google-mock-')) {
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
        return res.status(401).json({ message: getMessage('LINK_GOOGLE_TOKEN_INVALID') });
      }
    }

    // Check if this googleId is already linked to another account
    const checkLinked = await pool.query(
      'SELECT id FROM users WHERE google_id = $1',
      [googleId]
    );
    if (checkLinked.rows.length > 0) {
      return res.status(400).json({ message: getMessage('GOOGLE_ALREADY_LINKED') });
    }

    // Link it
    await pool.query(
      'UPDATE users SET google_id = $1 WHERE id = $2',
      [googleId, userId]
    );

    // Get updated user data
    const updatedUser = await pool.query(
      'SELECT id, family_id, email, name, role, avatar, google_id, line_id, child_id, onboarding_completed FROM users WHERE id = $1',
      [userId]
    );

    const user = updatedUser.rows[0];
    user.childId = user.child_id;
    user.onboardingCompleted = user.onboarding_completed;
    user.googleId = user.google_id;

    res.json({ 
      message: getMessage('LINK_GOOGLE_SUCCESS'),
      user
    });
  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({ message: getMessage('LINK_GOOGLE_ERROR') });
  }
};

// 5. Get Public Auth Configuration
export const getAuthConfig = async (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    lineChannelId: process.env.LINE_CHANNEL_ID || ""
  });
};

// 6. Get Current User Profile (Refreshes token with latest role/claims)
export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, family_id, email, name, role, avatar, child_id, google_id, line_id, onboarding_completed
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '找不到使用者。' });
    }

    const user = result.rows[0];
    user.childId = user.child_id;
    user.onboardingCompleted = user.onboarding_completed;
    user.googleId = user.google_id;

    // Generate a fresh token with the current database information
    const token = generateToken(user);

    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: '獲取使用者資訊失敗。' });
  }
};

// 7. Complete Onboarding (Parent only)
export const completeOnboarding = async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.query(
      'UPDATE users SET onboarding_completed = true WHERE id = $1',
      [userId]
    );
    res.json({ message: '家長引導設定已完成！' });
  } catch (error) {
    console.error('completeOnboarding error:', error);
    res.status(500).json({ message: '完成引導設定失敗。' });
  }
};

// 8. LINE Sign-In / Sign-Up
export const lineLogin = async (req, res) => {
  const { code, redirectUri } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'LINE authorization code is missing.' });
  }

  try {
    // 1. Exchange code for Access Token & ID Token using global fetch
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri || process.env.LINE_CALLBACK_URL || 'http://localhost:5173/');
    params.append('client_id', process.env.LINE_CHANNEL_ID);
    params.append('client_secret', process.env.LINE_CHANNEL_SECRET);

    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('Failed token exchange with LINE:', errBody);
      return res.status(400).json({ message: '與 LINE 伺服器連線驗證失敗。' });
    }

    const tokenData = await tokenRes.json();
    const { id_token } = tokenData;
    if (!id_token) {
      return res.status(400).json({ message: 'LINE OIDC ID Token is missing.' });
    }

    // 2. Decode ID Token (JWT format containing user info)
    const decoded = jwt.decode(id_token);
    if (!decoded) {
      return res.status(400).json({ message: '解密 LINE ID Token 失敗。' });
    }

    const lineId = decoded.sub; // LINE User ID
    const email = decoded.email?.toLowerCase(); // May be undefined if user didn't consent
    const name = decoded.name || 'LINE 用戶';
    const avatar = decoded.picture || 'girl';

    if (!lineId) {
      return res.status(400).json({ message: '無法取得 LINE 用戶識別碼。' });
    }

    const defaultEmail = email || `${lineId.substring(0, 15)}@line.questgrow.com`;

    // 3. Check if user already exists
    const findUser = await pool.query(
      'SELECT id, family_id, email, name, role, avatar, line_id, child_id, onboarding_completed FROM users WHERE line_id = $1 OR email = $2',
      [lineId, defaultEmail]
    );

    if (findUser.rows.length > 0) {
      let user = findUser.rows[0];

      // If email matched but line_id wasn't linked, link it now
      if (!user.line_id) {
        const updateResult = await pool.query(
          'UPDATE users SET line_id = $1 WHERE id = $2 RETURNING id, family_id, email, name, role, avatar, child_id, onboarding_completed',
          [lineId, user.id]
        );
        user = updateResult.rows[0];
      }

      user.childId = user.child_id;
      user.onboardingCompleted = user.onboarding_completed;
      const token = generateToken(user);

      await checkFirstLoginAndNotify(user.id);

      return res.json({
        message: 'LINE 登入成功！',
        token,
        user
      });
    }

    // 4. Register new user with LINE login (create Family + User)
    const randomPassword = Math.random().toString(36).substring(2, 11);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(randomPassword, salt);

    const client = await pool.connect();
    let newUserRow;
    try {
      await client.query('BEGIN');

      // Create a new Family
      const familyName = `${name}的家庭`;
      const newFamily = await client.query(
        'INSERT INTO families (name) VALUES ($1) RETURNING id',
        [familyName]
      );
      const familyId = newFamily.rows[0].id;

      // Create User account (parent by default)
      const newUser = await client.query(
        `INSERT INTO users (family_id, email, password_hash, name, role, avatar, line_id) 
         VALUES ($1, $2, $3, $4, 'parent', $5, $6) RETURNING id, family_id, email, name, role, avatar, child_id, onboarding_completed`,
        [familyId, defaultEmail, passwordHash, name, 'girl', lineId]
      );
      newUserRow = newUser.rows[0];

      await client.query('COMMIT');
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }

    const user = {
      ...newUserRow,
      childId: null,
      onboardingCompleted: false
    };
    const token = generateToken(user);

    await checkFirstLoginAndNotify(user.id);

    res.status(201).json({
      message: 'LINE 帳號註冊暨登入成功！',
      token,
      user
    });

  } catch (error) {
    console.error('LINE login controller error:', error);
    res.status(500).json({ message: 'LINE 登入時伺服器發生意外錯誤。' });
  }
};

// 9. Link LINE Account (For authenticated users)
export const linkLineAccount = async (req, res) => {
  const { code, redirectUri } = req.body;
  const userId = req.user.id;

  if (!code) {
    return res.status(400).json({ message: 'LINE authorization code is missing.' });
  }

  try {
    // 1. Exchange code for Token
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri || process.env.LINE_CALLBACK_URL || 'http://localhost:5173/');
    params.append('client_id', process.env.LINE_CHANNEL_ID);
    params.append('client_secret', process.env.LINE_CHANNEL_SECRET);

    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('Failed token exchange for linking LINE:', errBody);
      return res.status(400).json({ message: '與 LINE 伺服器進行綁定驗證失敗。' });
    }

    const tokenData = await tokenRes.json();
    const { id_token } = tokenData;
    if (!id_token) {
      return res.status(400).json({ message: 'LINE OIDC ID Token is missing.' });
    }

    // 2. Decode ID Token
    const decoded = jwt.decode(id_token);
    if (!decoded) {
      return res.status(400).json({ message: '解密 LINE ID Token 失敗。' });
    }

    const lineId = decoded.sub;
    if (!lineId) {
      return res.status(400).json({ message: '無法取得 LINE 用戶識別碼。' });
    }

    // 3. Check if this lineId is already linked to ANOTHER user
    const checkLinked = await pool.query(
      'SELECT id, name FROM users WHERE line_id = $1 AND id <> $2',
      [lineId, userId]
    );

    if (checkLinked.rows.length > 0) {
      return res.status(400).json({ message: '❌ 此 LINE 帳號已被其他 QuestGrow 帳號綁定。該帳戶已存在，請使用其他 LINE 帳號重新綁定！' });
    }

    // 4. Link LINE Account to Current User
    await pool.query(
      'UPDATE users SET line_id = $1 WHERE id = $2',
      [lineId, userId]
    );

    // Get updated user data
    const updatedUser = await pool.query(
      'SELECT id, family_id, email, name, role, avatar, line_id, child_id, onboarding_completed FROM users WHERE id = $1',
      [userId]
    );

    const user = updatedUser.rows[0];
    user.childId = user.child_id;
    user.onboardingCompleted = user.onboarding_completed;

    res.json({
      message: '🎉 LINE 帳號綁定成功！',
      user
    });

  } catch (error) {
    console.error('Link LINE account error:', error);
    res.status(500).json({ message: '綁定 LINE 帳號時伺服器發生意外錯誤。' });
  }
};

// 10. Unlink LINE Account
export const unlinkLineAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query(
      'UPDATE users SET line_id = NULL WHERE id = $1',
      [userId]
    );

    // Get updated user data
    const updatedUser = await pool.query(
      'SELECT id, family_id, email, name, role, avatar, line_id, child_id, onboarding_completed FROM users WHERE id = $1',
      [userId]
    );

    const user = updatedUser.rows[0];
    user.childId = user.child_id;
    user.onboardingCompleted = user.onboarding_completed;

    res.json({
      message: '🎉 LINE 帳號已成功解除連結！',
      user
    });

  } catch (error) {
    console.error('Unlink LINE account error:', error);
    res.status(500).json({ message: '解除綁定 LINE 帳號時伺服器發生意外錯誤。' });
  }
};
