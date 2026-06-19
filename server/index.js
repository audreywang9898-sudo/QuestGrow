import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import proverbRoutes from './routes/proverbRoutes.js';
import { getMessage, languageMiddleware } from './utils/messageManager.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── 0. Proxy Trust (MUST be before rate-limiters) ─────────────────────
// Render sits behind a reverse proxy. Without this, all requests appear to
// come from the same IP, breaking per-IP rate limiting.
app.set('trust proxy', 1);

// ── 1. Security Headers (Helmet) ──────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,     // Disabled: frontend served separately
  crossOriginEmbedderPolicy: false, // Allow cross-origin embeds
  crossOriginOpenerPolicy: false,   // CRITICAL: Must be false for Google OAuth popup to work.
                                    // Default COOP: same-origin breaks postMessage from OAuth windows.
}));

// ── 2. CORS ───────────────────────────────────────────────────────────
// If ALLOWED_ORIGINS env var is set (comma-separated), only those origins are allowed.
// If NOT set, all origins are allowed (backward-compatible default).
// To enable strict mode on Render: set ALLOWED_ORIGINS=https://your-frontend.onrender.com
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : null; // null = allow all (open CORS)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins) {
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// ── 3. Rate Limiting ──────────────────────────────────────────────────
// Auth endpoints: 30 requests per 15 minutes per real IP (trust proxy enabled above)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: '登入嘗試次數過多，請 15 分鐘後再試。Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
});

// General API limiter: 500 requests per 15 minutes per real IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: '請求過於頻繁，請稍後再試。Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);
app.use('/api', generalLimiter);


// ── 4. Body Parsing & i18n ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' })); // Cap request body to 10MB
app.use(languageMiddleware);

// ── 5. Static Files ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../dist')));

// ── 6. API Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: getMessage('SERVER_RUNNING') });
});

// ── 7. API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proverbs', proverbRoutes);


// ── 8. SPA Fallback ───────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ── 9. Global Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  // Never expose stack traces to the client in production
  const isDev = process.env.NODE_ENV !== 'production';
  console.error(err.stack);

  if (err.message === 'CORS policy violation') {
    return res.status(403).json({ message: 'CORS policy violation.' });
  }

  res.status(500).json({
    message: isDev ? err.message : getMessage('UNEXPECTED_SERVER_ERROR'),
  });
});

// ── 10. Start Server ──────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`QuestGrow Backend Server is running on port ${PORT}`);
  if (allowedOrigins) {
    console.log(`CORS strict mode — allowed origins: ${allowedOrigins.join(', ')}`);
  } else {
    console.log('CORS open mode — all origins allowed (set ALLOWED_ORIGINS env var to enable strict mode)');
  }
});

