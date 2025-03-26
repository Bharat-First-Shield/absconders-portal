import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../config/dynamodb.js';
import { s3Service } from '../services/s3.js';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'Criminals';

export const Criminal = {
  async create(data) {
    const criminalId = uuidv4();
    const timestamp = new Date().toISOString();

    // Handle file uploads
    const fileUploads = [];
    
    // Upload profile image if provided
    if (data.profileImage) {
      const uploadResult = await s3Service.uploadFile(
        data.profileImage,
        criminalId,
        'images',
        'profile.jpg'
      );
      fileUploads.push({ type: 'profile', ...uploadResult });
    }

    // Upload documents if provided
    if (data.documents) {
      for (const doc of data.documents) {
        const uploadResult = await s3Service.uploadFile(
          doc.file,
          criminalId,
          'documents',
          doc.name
        );
        fileUploads.push({ type: 'document', ...uploadResult });
      }
    }

    const item = {
      id: criminalId,
      ...data,
      files: fileUploads,
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
    
    if (response.Item) {
      // Generate presigned URLs for all files
      const files = response.Item.files || [];
      const updatedFiles = await Promise.all(
        files.map(async (file) => ({
          ...file,
          url: await s3Service.getPresignedUrl(file.key)
        }))
      );
      
      return {
        ...response.Item,
        files: updatedFiles
      };
    }
    
    return null;
  },

  async update(id, data) {
    const timestamp = new Date().toISOString();
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Handle file updates
    if (data.newFiles) {
      const fileUploads = [];
      
      for (const file of data.newFiles) {
        const uploadResult = await s3Service.uploadFile(
          file.file,
          id,
          file.type === 'profile' ? 'images' : 'documents',
          file.name
        );
        fileUploads.push({ type: file.type, ...uploadResult });
      }
      
      if (fileUploads.length > 0) {
        updateExpression.push('#files = list_append(if_not_exists(#files, :empty_list), :newFiles)');
        expressionAttributeNames['#files'] = 'files';
        expressionAttributeValues[':newFiles'] = fileUploads;
        expressionAttributeValues[':empty_list'] = [];
      }
    }

    // Handle other field updates
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'newFiles') {
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
    // First get the criminal record to get file references
    const criminal = await this.findById(id);
    
    if (criminal && criminal.files) {
      // Delete all associated files from S3
      await Promise.all(
        criminal.files.map(file => s3Service.deleteFile(file.key))
      );
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ReturnValues: 'ALL_OLD'
    });

    const response = await ddbDocClient.send(command);
    return response.Attributes;
  },

  // Other methods remain the same...
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
    
    // Generate presigned URLs for all files in the results
    const results = await Promise.all(
      (response.Items || []).map(async (item) => {
        if (item.files) {
          const updatedFiles = await Promise.all(
            item.files.map(async (file) => ({
              ...file,
              url: await s3Service.getPresignedUrl(file.key)
            }))
          );
          return { ...item, files: updatedFiles };
        }
        return item;
      })
    );
    
    return results;
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