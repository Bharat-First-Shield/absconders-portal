import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/dynamodb.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const TABLE_NAME = 'Credentials';

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
  }
};