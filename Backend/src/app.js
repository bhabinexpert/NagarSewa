// Express app configuration
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import issueRoutes from './routes/issues.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import feedRoutes from './routes/feed.js';
import broadcastRoutes from './routes/broadcasts.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/logger.js';
import { sendError, HTTP_STATUS } from './utils/response.js';

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/broadcasts', broadcastRoutes);

// 404 handler
app.use((req, res) => {
  sendError(res, 'Route not found', HTTP_STATUS.NOT_FOUND);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }
  
  // Send error response
  sendError(res, err.message || 'Internal server error', err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, err);
});

export default app;
