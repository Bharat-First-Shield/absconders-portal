import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/dynamodb.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'Criminals';

export const Criminal = {
  async create(data) {
    const criminalId = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
      id: criminalId,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
      statusHistory: [],
      auditLogs: []
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    });

    await ddbDocClient.send(command);
    return item;
  },

  async findById(id) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });

    const response = await ddbDocClient.send(command);
    return response.Item;
  },

  async findByFirNumber(firNumber) {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'FirNumberIndex',
      KeyConditionExpression: 'firNumber = :firNumber',
      ExpressionAttributeValues: {
        ':firNumber': firNumber
      }
    });

    const response = await ddbDocClient.send(command);
    return response.Items[0];
  },

  async update(id, data) {
    const timestamp = new Date().toISOString();
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id') {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Add updatedAt timestamp
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
    return response.Attributes;
  },

  async delete(id) {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ReturnValues: 'ALL_OLD'
    });

    const response = await ddbDocClient.send(command);
    return response.Attributes;
  },

  async search(params) {
    const { status, district, state, query } = params;
    let filterExpression = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    if (status) {
      filterExpression.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    if (district) {
      filterExpression.push('#district = :district');
      expressionAttributeNames['#district'] = 'district';
      expressionAttributeValues[':district'] = district;
    }

    if (state) {
      filterExpression.push('#state = :state');
      expressionAttributeNames['#state'] = 'state';
      expressionAttributeValues[':state'] = state;
    }

    if (query) {
      filterExpression.push('contains(#name, :query) OR contains(#firNumber, :query)');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeNames['#firNumber'] = 'firNumber';
      expressionAttributeValues[':query'] = query;
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      FilterExpression: filterExpression.length > 0 ? filterExpression.join(' AND ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined
    });

    const response = await ddbDocClient.send(command);
    return response.Items;
  },

  async updateStatus(id, newStatus, userId, userName, notes) {
    const criminal = await this.findById(id);
    if (!criminal) {
      throw new Error('Criminal not found');
    }

    const statusChange = {
      id: uuidv4(),
      previousStatus: criminal.status,
      newStatus,
      changedBy: userId,
      changedByName: userName,
      timestamp: new Date().toISOString(),
      notes
    };

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #status = :newStatus, #statusHistory = list_append(#statusHistory, :statusChange), #updatedAt = :timestamp',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#statusHistory': 'statusHistory',
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':newStatus': newStatus,
        ':statusChange': [statusChange],
        ':timestamp': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    const response = await ddbDocClient.send(command);
    return response.Attributes;
  }
};