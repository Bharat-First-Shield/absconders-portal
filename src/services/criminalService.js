import { Criminal, dbOperations } from '../utils/database.js';

/**
 * Criminal service for handling criminal record operations
 */
const criminalService = {
  /**
   * Create a new criminal record
   * @param {Object} criminalData - Criminal data
   * @returns {Promise<Object>} Created criminal record
   */
  async createCriminal(criminalData) {
    try {
      return await dbOperations.create(Criminal, criminalData);
    } catch (error) {
      console.error('Error creating criminal record:', error);
      throw error;
    }
  },

  /**
   * Get criminal record by ID
   * @param {string} criminalId - Criminal ID
   * @returns {Promise<Object>} Criminal document
   */
  async getCriminalById(criminalId) {
    try {
      return await dbOperations.findById(Criminal, criminalId);
    } catch (error) {
      console.error('Error getting criminal by ID:', error);
      throw error;
    }
  },

  /**
   * Update criminal record by ID
   * @param {string} criminalId - Criminal ID
   * @param {Object} updateData - Update data
   * @param {string} updatedBy - User ID who updated the record
   * @returns {Promise<Object>} Updated criminal record
   */
  async updateCriminal(criminalId, updateData, updatedBy) {
    try {
      // Add last updated by information
      const dataWithUpdater = {
        ...updateData,
        lastUpdatedBy: updatedBy
      };
      
      return await dbOperations.updateById(Criminal, criminalId, dataWithUpdater);
    } catch (error) {
      console.error('Error updating criminal record:', error);
      throw error;
    }
  },

  /**
   * Delete criminal record by ID
   * @param {string} criminalId - Criminal ID
   * @returns {Promise<Object>} Deleted criminal record
   */
  async deleteCriminal(criminalId) {
    try {
      return await dbOperations.deleteById(Criminal, criminalId);
    } catch (error) {
      console.error('Error deleting criminal record:', error);
      throw error;
    }
  },

  /**
   * Search criminal records
   * @param {Object} query - Search parameters
   * @param {number} limit - Results limit
   * @returns {Promise<Array>} Matching criminal records
   */
  async searchCriminals(query, limit = 20) {
    try {
      const { name, firNumber, idNumber, district, state, status, hasActiveWarrant } = query;
      
      const searchQuery = {};
      
      // Build search query based on provided parameters
      if (name) searchQuery.name = new RegExp(name, 'i');
      if (firNumber) searchQuery.firNumber = new RegExp(firNumber, 'i');
      if (idNumber) searchQuery['idProof.number'] = new RegExp(idNumber, 'i');
      if (district) searchQuery.district = district;
      if (state) searchQuery.state = state;
      if (status) searchQuery.status = status;
      
      // Handle active warrant filter
      if (hasActiveWarrant) {
        searchQuery['warrants.isActive'] = true;
      }
      
      return await dbOperations.find(
        Criminal,
        searchQuery,
        { sort: { updatedAt: -1 }, limit }
      );
    } catch (error) {
      console.error('Error searching criminal records:', error);
      throw error;
    }
  },

  /**
   * Get criminal statistics
   * @returns {Promise<Object>} Criminal statistics
   */
  async getCriminalStats() {
    try {
      const totalCases = await dbOperations.count(Criminal);
      const activeWarrants = await dbOperations.count(Criminal, { 'warrants.isActive': true });
      const arrestedCount = await dbOperations.count(Criminal, { status: 'arrested' });
      
      // Get district breakdown
      const districtStats = await dbOperations.aggregate(Criminal, [
        {
          $group: {
            _id: '$district',
            count: { $sum: 1 },
            activeWarrants: {
              $sum: {
                $cond: [
                  { $gt: [{ $size: { $filter: { input: '$warrants', as: 'w', cond: '$$w.isActive' } } }, 0] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      return {
        totalCases,
        activeWarrants,
        arrestedCount,
        districtStats
      };
    } catch (error) {
      console.error('Error getting criminal statistics:', error);
      throw error;
    }
  },

  /**
   * Add warrant to criminal record
   * @param {string} criminalId - Criminal ID
   * @param {Object} warrantData - Warrant data
   * @param {string} updatedBy - User ID who added the warrant
   * @returns {Promise<Object>} Updated criminal record
   */
  async addWarrant(criminalId, warrantData, updatedBy) {
    try {
      const criminal = await dbOperations.findById(Criminal, criminalId);
      
      if (!criminal) {
        throw new Error('Criminal record not found');
      }
      
      criminal.warrants.push(warrantData);
      criminal.lastUpdatedBy = updatedBy;
      
      return await criminal.save();
    } catch (error) {
      console.error('Error adding warrant:', error);
      throw error;
    }
  },

  /**
   * Update warrant status
   * @param {string} criminalId - Criminal ID
   * @param {string} warrantId - Warrant ID
   * @param {boolean} isActive - Warrant active status
   * @param {string} updatedBy - User ID who updated the warrant
   * @returns {Promise<Object>} Updated criminal record
   */
  async updateWarrantStatus(criminalId, warrantId, isActive, updatedBy) {
    try {
      const criminal = await dbOperations.findById(Criminal, criminalId);
      
      if (!criminal) {
        throw new Error('Criminal record not found');
      }
      
      const warrant = criminal.warrants.id(warrantId);
      
      if (!warrant) {
        throw new Error('Warrant not found');
      }
      
      warrant.isActive = isActive;
      criminal.lastUpdatedBy = updatedBy;
      
      return await criminal.save();
    } catch (error) {
      console.error('Error updating warrant status:', error);
      throw error;
    }
  }
};

export default criminalService;