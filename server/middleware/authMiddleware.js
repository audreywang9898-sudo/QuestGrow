import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/db.js';
import { getMessage } from '../utils/messageManager.js';
import { trackUserActivity } from '../utils/sessionTracker.js';

dotenv.config();

// Real JWT revocation: a decoded token's embedded token_version must match
// the user's current DB value. Bumping the DB value (logout-everywhere,
// password change) instantly invalidates every token issued before that,
// even though tokens are otherwise stateless with a 7-day expiry.
const isTokenVersionCurrent = async (decoded) => {
  const result = await pool.query('SELECT token_version FROM users WHERE id = $1', [decoded.id]);
  if (result.rows.length === 0) return false;
  const currentVersion = result.rows[0].token_version ?? 0;
  const tokenVersion = decoded.token_version ?? 0;
  return tokenVersion === currentVersion;
};

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: getMessage('AUTH_TOKEN_MISSING') });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: getMessage('AUTH_TOKEN_INVALID') });
    }

    try {
      if (!(await isTokenVersionCurrent(decoded))) {
        return res.status(403).json({ message: getMessage('AUTH_TOKEN_INVALID') });
      }
    } catch (dbErr) {
      console.error('authenticateToken token_version check error:', dbErr);
      return res.status(500).json({ message: getMessage('UNEXPECTED_SERVER_ERROR') });
    }

    req.user = decoded; // { id, email, role, family_id, child_id, token_version }

    // Track active user session
    trackUserActivity(decoded.id);

    next();
  });
};

export const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (!err) {
      // Best-effort: a revoked/stale token here just means "treat as
      // anonymous" rather than blocking the request outright.
      try {
        if (await isTokenVersionCurrent(decoded)) {
          req.user = decoded;
          trackUserActivity(decoded.id);
        }
      } catch (dbErr) {
        console.error('optionalAuthenticateToken token_version check error:', dbErr);
      }
    }
    next();
  });
};

// requireRole accepts one or more role strings.
// Example: requireRole('parent') or requireRole('parent', 'admin')
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: getMessage('INSUFFICIENT_PERMISSION', { role: roles.join('/') }) });
    }
    next();
  };
};

