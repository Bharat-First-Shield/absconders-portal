import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeDynamoDB } from './config/dynamodb.js';
import { errorHandler } from './middleware/error.js';
import logger from './config/logger.js';

// Route imports
import authRoutes from './routes/auth.js';
import criminalRoutes from './routes/criminals.js';

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Initialize DynamoDB
initializeDynamoDB()
  .then(() => {
    logger.info('DynamoDB initialized successfully');
  })
  .catch((error) => {
    logger.error('Failed to initialize DynamoDB:', error);
    process.exit(1);
  });

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/criminals', criminalRoutes);

// Error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

const PORT = process.env.BACKEND_PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});