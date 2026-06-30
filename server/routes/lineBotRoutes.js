import express from 'express';
import { handleWebhook } from '../controllers/lineBotController.js';

const router = express.Router();

/**
 * LINE requires the raw body for signature verification.
 * We apply express.raw() only to this route.
 */
router.post(
  '/webhook',
  handleWebhook
);

export default router;
