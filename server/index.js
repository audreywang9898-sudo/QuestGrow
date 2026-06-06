import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import { getMessage, languageMiddleware } from './utils/messageManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests to support frontends running on different ports/domains
app.use(cors());
app.use(express.json());
app.use(languageMiddleware);

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

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('QuestGrow API server. Server is healthy.');
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
