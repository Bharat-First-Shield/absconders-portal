import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/dynamodb.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'Users';

export const Credentials = {
  async validateCredentials(username, password) {
    try {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': username
        }
      });

      const response = await ddbDocClient.send(command);
      const user = response.Items?.[0];

      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        district: user.district,
        state: user.state,
        policeStation: user.policeStation
      };
    } catch (error) {
      console.error('Error validating credentials:', error);
      throw error;
    }
  },

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        district: user.district,
        state: user.state,
        policeStation: user.policeStation
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  },

  async createInitialAdminUser() {
    try {
      // Check if admin user already exists
      const checkCommand = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': 'admin'
        }
      });

      const existingUser = await ddbDocClient.send(checkCommand);
      if (existingUser.Items?.length > 0) {
        console.log('Admin user already exists');
        return;
      }

      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);

      const adminUser = {
        id: uuidv4(),
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
        createdAt: new Date().toISOString()
      };

      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: adminUser,
        ConditionExpression: 'attribute_not_exists(username)'
      });

      await ddbDocClient.send(command);
      console.log('Admin user created successfully');
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.log('Admin user already exists');
        return;
      }
      throw error;
    }
  }
};