import express from 'express';
import { initializeDynamoDB } from './config/dynamodb.js';
import { createUsersTable } from './config/createTables.js';
import dotenv from 'dotenv';
import logger from './config/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DynamoDB and create tables
const initializeDatabase = async () => {
  try {
    await initializeDynamoDB();
    await createUsersTable();
    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});

// Basic error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    logger.info('Server shutting down...');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});