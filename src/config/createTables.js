import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from './dynamodb.js';
import { Credentials } from '../models/Credentials.js';
import logger from './logger.js';

export const createUsersTable = async () => {
  const params = {
    TableName: 'Users',
    KeySchema: [
      { AttributeName: 'username', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'username', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    await ddbDocClient.send(new CreateTableCommand(params));
    logger.info('Users table created successfully');
    
    // Create initial admin user
    await Credentials.createInitialAdminUser();
    logger.info('Initial admin user created successfully');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      logger.info('Users table already exists');
    } else {
      logger.error('Error creating Users table:', error);
      throw error;
    }
  }
};