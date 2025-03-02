// This is a mock implementation of the database module
// In a real app, this would connect to MongoDB

// Import mock data
import { mockCriminals, mockUsers } from './mockData';

// Create a mock Database class
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
    console.log('Mock database connection established');
    this.isConnected = true;
    return { connection: { host: 'mock-db-host' } };
  }

  async disconnect() {
    console.log('Mock database disconnected');
    this.isConnected = false;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
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

const Profile = {
  find: () => Promise.resolve([]),
  findById: () => Promise.resolve(null),
  findOne: () => Promise.resolve(null)
};

const Criminal = {
  find: () => Promise.resolve(mockCriminals),
  findById: (id) => Promise.resolve(mockCriminals.find(criminal => criminal._id === id)),
  findOne: (query) => Promise.resolve(mockCriminals.find(criminal => criminal._id === query._id)),
  distinct: () => Promise.resolve(['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik']),
  aggregate: () => Promise.resolve([])
};

// Mock database operations
const dbOperations = {
  connect: () => dbInstance.connect(),
  
  async create(model, data) {
    console.log('Mock create operation', model, data);
    return { ...data, _id: Math.random().toString(36).substring(7) };
  },

  async find(model, query = {}, options = {}) {
    console.log('Mock find operation', model, query);
    if (model === Criminal) {
      return mockCriminals;
    }
    return [];
  },

  async findById(model, id, projection = {}) {
    console.log('Mock findById operation', model, id);
    if (model === Criminal) {
      return mockCriminals.find(criminal => criminal._id === id);
    }
    return null;
  },

  async findOne(model, query, projection = {}) {
    console.log('Mock findOne operation', model, query);
    if (model === User && query.email) {
      return mockUsers.find(user => user.email === query.email);
    }
    return null;
  },

  async updateById(model, id, data, options = {}) {
    console.log('Mock updateById operation', model, id, data);
    return { _id: id, ...data };
  },

  async updateMany(model, query, data, options = {}) {
    console.log('Mock updateMany operation', model, query, data);
    return { modifiedCount: 1 };
  },

  async deleteById(model, id) {
    console.log('Mock deleteById operation', model, id);
    return { _id: id };
  },

  async deleteMany(model, query) {
    console.log('Mock deleteMany operation', model, query);
    return { deletedCount: 1 };
  },

  async count(model, query = {}) {
    console.log('Mock count operation', model, query);
    if (model === Criminal) {
      if (query['warrants.isActive'] === true) {
        return 60; // Active warrants count
      }
      return 83; // Total cases count
    }
    return 0;
  },

  async aggregate(model, pipeline) {
    console.log('Mock aggregate operation', model, pipeline);
    return [];
  }
};

// Export database instance, models, and operations
export {
  dbInstance,
  User,
  Profile,
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
    Profile,
    Criminal
  },
  operations: dbOperations
};