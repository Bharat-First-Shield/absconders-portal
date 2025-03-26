import { Criminal } from '../models/Criminal.js';
import logger from '../config/logger.js';

// @desc    Get all criminals
// @route   GET /api/criminals
// @access  Private
export const getCriminals = async (req, res) => {
  try {
    const query = {};

    // Build query based on filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.district) {
      query.district = req.query.district;
    }

    if (req.query.state) {
      query.state = req.query.state;
    }

    if (req.query.hasWarrant === 'true') {
      query['warrants.isActive'] = true;
    }

    const criminals = await Criminal.find(query)
      .populate('createdBy', 'name')
      .populate('lastUpdatedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: criminals.length,
      data: criminals
    });
  } catch (error) {
    logger.error('Get criminals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving criminals'
    });
  }
};

// @desc    Get single criminal
// @route   GET /api/criminals/:id
// @access  Private
export const getCriminal = async (req, res) => {
  try {
    const criminal = await Criminal.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('lastUpdatedBy', 'name')
      .populate('statusHistory.changedBy', 'name');

    if (!criminal) {
      return res.status(404).json({
        success: false,
        message: 'Criminal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: criminal
    });
  } catch (error) {
    logger.error('Get criminal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving criminal'
    });
  }
};

// @desc    Create new criminal
// @route   POST /api/criminals
// @access  Private
export const createCriminal = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    req.body.lastUpdatedBy = req.user.id;

    const criminal = await Criminal.create(req.body);

    res.status(201).json({
      success: true,
      data: criminal
    });
  } catch (error) {
    logger.error('Create criminal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating criminal record'
    });
  }
};

// @desc    Update criminal
// @route   PUT /api/criminals/:id
// @access  Private
export const updateCriminal = async (req, res) => {
  try {
    let criminal = await Criminal.findById(req.params.id);

    if (!criminal) {
      return res.status(404).json({
        success: false,
        message: 'Criminal not found'
      });
    }

    // Handle status change
    if (req.body.status && req.body.status !== criminal.status) {
      criminal.statusHistory.push({
        previousStatus: criminal.status,
        newStatus: req.body.status,
        changedBy: req.user.id,
        changedByName: req.user.name,
        notes: req.body.statusNotes
      });
    }

    req.body.lastUpdatedBy = req.user.id;

    criminal = await Criminal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: criminal
    });
  } catch (error) {
    logger.error('Update criminal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating criminal record'
    });
  }
};

// @desc    Delete criminal
// @route   DELETE /api/criminals/:id
// @access  Private
export const deleteCriminal = async (req, res) => {
  try {
    const criminal = await Criminal.findById(req.params.id);

    if (!criminal) {
      return res.status(404).json({
        success: false,
        message: 'Criminal not found'
      });
    }

    await criminal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Delete criminal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting criminal record'
    });
  }
};

// @desc    Search criminals
// @route   GET /api/criminals/search
// @access  Private
export const searchCriminals = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const criminals = await Criminal.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { firNumber: { $regex: query, $options: 'i' } },
        { 'idProof.number': { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.status(200).json({
      success: true,
      count: criminals.length,
      data: criminals
    });
  } catch (error) {
    logger.error('Search criminals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching criminals'
    });
  }
};