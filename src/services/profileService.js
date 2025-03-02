import { Profile, dbOperations } from '../utils/database.js';

/**
 * Profile service for handling profile-related operations
 */
const profileService = {
  /**
   * Create a new profile
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Created profile
   */
  async createProfile(profileData) {
    try {
      return await dbOperations.create(Profile, profileData);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  /**
   * Get profile by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Profile document
   */
  async getProfileByUserId(userId) {
    try {
      return await dbOperations.findOne(Profile, { userId });
    } catch (error) {
      console.error('Error getting profile by user ID:', error);
      throw error;
    }
  },

  /**
   * Update profile by user ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(userId, updateData) {
    try {
      const profile = await dbOperations.findOne(Profile, { userId });
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return await dbOperations.updateById(Profile, profile._id, updateData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Delete profile by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted profile
   */
  async deleteProfile(userId) {
    try {
      const profile = await dbOperations.findOne(Profile, { userId });
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return await dbOperations.deleteById(Profile, profile._id);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  /**
   * Update profile image
   * @param {string} userId - User ID
   * @param {string} imageUrl - Profile image URL
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfileImage(userId, imageUrl) {
    try {
      const profile = await dbOperations.findOne(Profile, { userId });
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return await dbOperations.updateById(Profile, profile._id, { profileImage: imageUrl });
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  }
};

export default profileService;