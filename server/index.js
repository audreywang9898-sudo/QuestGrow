import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { getMessage, languageMiddleware } from './utils/messageManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests to support frontends running on different ports/domains
app.use(cors());
app.use(express.json());
app.use(languageMiddleware);

// Serve static files from the React frontend build directory
app.use(express.static(path.join(__dirname, '../dist')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: getMessage('SERVER_RUNNING') });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/admin', adminRoutes);

// Wildcard fallback route to serve index.html for client-side routing (excluding /api routes)
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: getMessage('UNEXPECTED_SERVER_ERROR') });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`QuestGrow Backend Server is running on port ${PORT}`);
});
