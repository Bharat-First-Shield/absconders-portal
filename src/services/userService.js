import { User, dbOperations } from '../utils/database.js';

/**
 * User service for handling user-related operations
 */
const userService = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      return await dbOperations.create(User, userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User document
   */
  async getUserById(userId) {
    try {
      return await dbOperations.findById(User, userId, { password: 0 });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {Promise<Object>} User document
   */
  async getUserByUsername(username) {
    try {
      return await dbOperations.findOne(User, { username }, { password: 0 });
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  },

  /**
   * Get user by email
   * @param {string} email - Email address
   * @returns {Promise<Object>} User document
   */
  async getUserByEmail(email) {
    try {
      return await dbOperations.findOne(User, { email }, { password: 0 });
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    try {
      // Prevent updating sensitive fields
      const { password, ...safeUpdateData } = updateData;
      return await dbOperations.updateById(User, userId, safeUpdateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user
   */
  async deleteUser(userId) {
    try {
      return await dbOperations.deleteById(User, userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Get all users with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Users and pagination info
   */
  async getAllUsers(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const users = await dbOperations.find(
        User,
        {},
        { projection: { password: 0 }, sort: { createdAt: -1 }, limit, skip }
      );
      const total = await dbOperations.count(User);
      
      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  /**
   * Search users by query
   * @param {string} query - Search query
   * @param {number} limit - Results limit
   * @returns {Promise<Array>} Matching users
   */
  async searchUsers(query, limit = 10) {
    try {
      const searchRegex = new RegExp(query, 'i');
      return await dbOperations.find(
        User,
        {
          $or: [
            { username: searchRegex },
            { email: searchRegex }
          ]
        },
        { projection: { password: 0 }, limit }
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};

export default userService;