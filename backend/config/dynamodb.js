import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

export const initializeDynamoDB = async () => {
  try {
    // Test the connection
    await client.config.credentials();
    logger.info('DynamoDB connection successful');
    return ddbDocClient;
  } catch (error) {
    logger.error('DynamoDB connection error:', error);
    throw error;
  }
};

export { ddbDocClient };