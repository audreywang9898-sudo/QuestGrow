import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getMessage } from '../utils/messageManager.js';

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
    next();
  });
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: getMessage('INSUFFICIENT_PERMISSION', { role }) });
    }
    next();
  };
};
