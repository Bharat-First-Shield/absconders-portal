import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/dynamodb.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const TABLE_NAME = 'Users';

export const User = {
  async create(userData) {
    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const item = {
      id: userId,
      ...userData,
      password: hashedPassword,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLogin: timestamp
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(email)'
    });

    try {
      await ddbDocClient.send(command);
      const { password, ...userWithoutPassword } = item;
      return userWithoutPassword;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  },

  async findById(id) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });

    const response = await ddbDocClient.send(command);
    if (!response.Item) return null;

    const { password, ...userWithoutPassword } = response.Item;
    return userWithoutPassword;
  },

  async findByEmail(email) {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    });

    const response = await ddbDocClient.send(command);
    return response.Items[0];
  },

  async update(id, updateData) {
    const timestamp = new Date().toISOString();
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'password') {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = timestamp;

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const response = await ddbDocClient.send(command);
    const { password, ...userWithoutPassword } = response.Attributes;
    return userWithoutPassword;
  },

  async updateLastLogin(id) {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET lastLogin = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    await ddbDocClient.send(command);
  },

  async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
  },

  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }
};