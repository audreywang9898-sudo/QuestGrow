import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getMessage } from '../utils/messageManager.js';
import { trackUserActivity } from '../utils/sessionTracker.js';

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: getMessage('AUTH_TOKEN_MISSING') });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: getMessage('AUTH_TOKEN_INVALID') });
    }
    req.user = decoded; // { id, email, role, family_id, child_id }
    
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

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
      trackUserActivity(decoded.id);
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

