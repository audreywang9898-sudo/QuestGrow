import express from 'express';
import { handleWebhook } from '../controllers/lineBotController.js';

const router = express.Router();

/**
 * LINE requires the raw body for signature verification.
 * We apply express.raw() only to this route.
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Store raw body string before JSON parse overwrites it
    req.rawBody = req.body?.toString('utf8') || '';
    // Parse body for controller use
    try {
      req.body = JSON.parse(req.rawBody);
    } catch {
      req.body = {};
    }
    next();
  },
  handleWebhook
);

export default router;
