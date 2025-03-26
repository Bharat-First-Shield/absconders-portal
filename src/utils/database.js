// Mock database implementation
import { v4 as uuidv4 } from 'uuid';
import { 
  mockCriminals, 
  mockUsers, 
  updateMockCriminal,
  addStatusChange,
  addAuditLog,
  getStatusHistory,
  getAuditLogs,
  getCasesByStatus
} from './mockData';

// Create a Database class with singleton pattern
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.isConnected = false;
    this.connection = null;
    Database.instance = this;
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log('Using existing database connection');
        return this.connection;
      }

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isConnected = true;
      this.connection = { isConnected: true };
      
      console.log('Mock database connection established successfully');
      
      return this.connection;
    } catch (error) {
      console.error('Database connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      this.isConnected = false;
      this.connection = null;
      console.log('Mock database disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const dbInstance = new Database();

// Mock models
const User = {
  find: () => Promise.resolve(mockUsers),
  findById: (id) => Promise.resolve(mockUsers.find(user => user._id === id)),
  findOne: (query) => {
    if (query.email) {
      return Promise.resolve(mockUsers.find(user => user.email === query.email));
    }
    return Promise.resolve(null);
  },
  distinct: () => Promise.resolve(['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik']),
  aggregate: () => Promise.resolve([])
};

const Criminal = {
  find: () => Promise.resolve(mockCriminals),
  findById: (id) => Promise.resolve(mockCriminals.find(criminal => criminal._id === id)),
  findOne: (query) => Promise.resolve(mockCriminals.find(criminal => criminal._id === query._id)),
  distinct: () => Promise.resolve(['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik']),
  aggregate: () => Promise.resolve([])
};

// Database operations
const dbOperations = {
  connect: () => dbInstance.connect(),
  
  async create(model, data) {
    try {
      const newId = uuidv4();
      const newDoc = { 
        _id: newId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (model === User) {
        mockUsers.push(newDoc);
      } else if (model === Criminal) {
        mockCriminals.push(newDoc);
      }

      return newDoc;
    } catch (error) {
      console.error(`Error creating document:`, error);
      throw error;
    }
  },

  async find(model, query = {}, options = {}) {
    try {
      let results = model === User ? [...mockUsers] : [...mockCriminals];
      
      // Apply query filters
      if (Object.keys(query).length > 0) {
        results = results.filter(doc => 
          Object.entries(query).every(([key, value]) => doc[key] === value)
        );
      }
      
      // Apply sorting
      if (options.sort) {
        const [sortField, sortOrder] = Object.entries(options.sort)[0];
        results.sort((a, b) => {
          if (sortOrder === -1) {
            return b[sortField] > a[sortField] ? 1 : -1;
          }
          return a[sortField] > b[sortField] ? 1 : -1;
        });
      }
      
      // Apply pagination
      if (options.skip) {
        results = results.slice(options.skip);
      }
      if (options.limit) {
        results = results.slice(0, options.limit);
      }
      
      return results;
    } catch (error) {
      console.error(`Error finding documents:`, error);
      throw error;
    }
  },

  async findById(model, id, projection = {}) {
    try {
      const doc = model === User 
        ? mockUsers.find(u => u._id === id)
        : mockCriminals.find(c => c._id === id);
        
      if (!doc) return null;
      
      // Apply projection
      if (Object.keys(projection).length > 0) {
        return Object.fromEntries(
          Object.entries(doc).filter(([key]) => projection[key])
        );
      }
      
      return doc;
    } catch (error) {
      console.error(`Error finding document by ID:`, error);
      throw error;
    }
  },

  async findOne(model, query, projection = {}) {
    try {
      const doc = model === User 
        ? mockUsers.find(u => 
            Object.entries(query).every(([key, value]) => u[key] === value)
          )
        : mockCriminals.find(c => 
            Object.entries(query).every(([key, value]) => c[key] === value)
          );
        
      if (!doc) return null;
      
      // Apply projection
      if (Object.keys(projection).length > 0) {
        return Object.fromEntries(
          Object.entries(doc).filter(([key]) => projection[key])
        );
      }
      
      return doc;
    } catch (error) {
      console.error(`Error finding one document:`, error);
      throw error;
    }
  },

  async updateById(model, id, data) {
    try {
      const index = model === User 
        ? mockUsers.findIndex(u => u._id === id)
        : mockCriminals.findIndex(c => c._id === id);
        
      if (index === -1) return null;
      
      const updatedDoc = {
        ...model === User ? mockUsers[index] : mockCriminals[index],
        ...data,
        updatedAt: new Date()
      };
      
      if (model === User) {
        mockUsers[index] = updatedDoc;
      } else {
        mockCriminals[index] = updatedDoc;
      }
      
      return updatedDoc;
    } catch (error) {
      console.error(`Error updating document:`, error);
      throw error;
    }
  },

  async deleteById(model, id) {
    try {
      if (model === User) {
        const index = mockUsers.findIndex(u => u._id === id);
        if (index === -1) return null;
        return mockUsers.splice(index, 1)[0];
      } else {
        const index = mockCriminals.findIndex(c => c._id === id);
        if (index === -1) return null;
        return mockCriminals.splice(index, 1)[0];
      }
    } catch (error) {
      console.error(`Error deleting document:`, error);
      throw error;
    }
  },

  async count(model, query = {}) {
    try {
      const docs = model === User ? mockUsers : mockCriminals;
      
      if (Object.keys(query).length === 0) {
        return docs.length;
      }
      
      return docs.filter(doc => 
        Object.entries(query).every(([key, value]) => doc[key] === value)
      ).length;
    } catch (error) {
      console.error(`Error counting documents:`, error);
      throw error;
    }
  },

  async aggregate(model, pipeline) {
    // For simplicity, we'll just return an empty array for aggregations
    return [];
  }
};

// Export database instance, models, and operations
export {
  dbInstance,
  User,
  Criminal,
  dbOperations
};

// Default export for convenience
export default {
  connect: dbInstance.connect.bind(dbInstance),
  disconnect: dbInstance.disconnect.bind(dbInstance),
  getConnectionStatus: dbInstance.getConnectionStatus.bind(dbInstance),
  models: {
    User,
    Criminal
  },
  operations: dbOperations
};