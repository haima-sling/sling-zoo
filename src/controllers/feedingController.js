const Feeding = require('../models/Feeding');
const Animal = require('../models/Animal');
const Exhibit = require('../models/Exhibit');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get all feeding schedules with pagination and filtering
const getAllFeedings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.animalId) filter.animalId = req.query.animalId;
    if (req.query.exhibitId) filter.exhibitId = req.query.exhibitId;
    if (req.query.completed !== undefined) filter.completed = req.query.completed === 'true';
    if (req.query.foodType) filter.foodType = new RegExp(req.query.foodType, 'i');
    
    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.scheduledTime = 1;
    }
    
    const feedings = await Feeding.find(filter)
      .populate('animalId', 'name species gender')
      .populate('exhibitId', 'name type')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Feeding.countDocuments(filter);
    
    res.json({
      success: true,
      data: feedings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching feedings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feeding schedules',
      error: error.message
    });
  }
};

// Get feeding by ID
const getFeedingById = async (req, res) => {
  try {
    const feeding = await Feeding.findById(req.params.id)
      .populate('animalId', 'name species gender diet')
      .populate('exhibitId', 'name type');
    
    if (!feeding) {
      return res.status(404).json({
        success: false,
        message: 'Feeding schedule not found'
      });
    }
    
    res.json({
      success: true,
      data: feeding
    });
  } catch (error) {
    logger.error('Error fetching feeding:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feeding schedule',
      error: error.message
    });
  }
};

// Create new feeding schedule
const createFeeding = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    // Verify animal exists
    const animal = await Animal.findById(req.body.animalId);
    if (!animal) {
      return res.status(400).json({
        success: false,
        message: 'Animal not found'
      });
    }
    
    // Add animal name and exhibit ID
    req.body.animalName = animal.name;
    req.body.exhibitId = animal.exhibitId;
    
    const feeding = new Feeding(req.body);
    await feeding.save();
    
    logger.info(`New feeding schedule created for animal: ${animal.name}`);
    
    res.status(201).json({
      success: true,
      message: 'Feeding schedule created successfully',
      data: feeding
    });
  } catch (error) {
    logger.error('Error creating feeding schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating feeding schedule',
      error: error.message
    });
  }
};

// Update feeding schedule
const updateFeeding = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const feeding = await Feeding.findById(req.params.id);
    if (!feeding) {
      return res.status(404).json({
        success: false,
        message: 'Feeding schedule not found'
      });
    }
    
    const updatedFeeding = await Feeding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('animalId', 'name species');
    
    logger.info(`Feeding schedule updated for animal: ${updatedFeeding.animalName}`);
    
    res.json({
      success: true,
      message: 'Feeding schedule updated successfully',
      data: updatedFeeding
    });
  } catch (error) {
    logger.error('Error updating feeding schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feeding schedule',
      error: error.message
    });
  }
};

// Delete feeding schedule
const deleteFeeding = async (req, res) => {
  try {
    const feeding = await Feeding.findById(req.params.id);
    if (!feeding) {
      return res.status(404).json({
        success: false,
        message: 'Feeding schedule not found'
      });
    }
    
    await Feeding.findByIdAndDelete(req.params.id);
    
    logger.info(`Feeding schedule deleted for animal: ${feeding.animalName}`);
    
    res.json({
      success: true,
      message: 'Feeding schedule deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting feeding schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feeding schedule',
      error: error.message
    });
  }
};

// Mark feeding as completed
const markFeedingCompleted = async (req, res) => {
  try {
    const { completedBy, notes } = req.body;
    
    const feeding = await Feeding.findById(req.params.id);
    if (!feeding) {
      return res.status(404).json({
        success: false,
        message: 'Feeding schedule not found'
      });
    }
    
    if (feeding.completed) {
      return res.status(400).json({
        success: false,
        message: 'Feeding already marked as completed'
      });
    }
    
    feeding.completed = true;
    feeding.completedBy = completedBy;
    feeding.completedAt = new Date();
    if (notes) feeding.notes = notes;
    
    await feeding.save();
    
    logger.info(`Feeding completed for animal: ${feeding.animalName} by ${completedBy}`);
    
    res.json({
      success: true,
      message: 'Feeding marked as completed',
      data: feeding
    });
  } catch (error) {
    logger.error('Error marking feeding as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking feeding as completed',
      error: error.message
    });
  }
};

// Get pending feedings
const getPendingFeedings = async (req, res) => {
  try {
    const feedings = await Feeding.find({ completed: false })
      .populate('animalId', 'name species gender')
      .populate('exhibitId', 'name type')
      .sort({ scheduledTime: 1 });
    
    res.json({
      success: true,
      data: feedings
    });
  } catch (error) {
    logger.error('Error fetching pending feedings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending feedings',
      error: error.message
    });
  }
};

// Get feedings by animal
const getFeedingsByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;
    
    const feedings = await Feeding.find({ animalId })
      .populate('exhibitId', 'name type')
      .sort({ scheduledTime: -1 });
    
    res.json({
      success: true,
      data: feedings
    });
  } catch (error) {
    logger.error('Error fetching feedings by animal:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedings by animal',
      error: error.message
    });
  }
};

// Get feedings by exhibit
const getFeedingsByExhibit = async (req, res) => {
  try {
    const { exhibitId } = req.params;
    
    const feedings = await Feeding.find({ exhibitId })
      .populate('animalId', 'name species gender')
      .sort({ scheduledTime: -1 });
    
    res.json({
      success: true,
      data: feedings
    });
  } catch (error) {
    logger.error('Error fetching feedings by exhibit:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedings by exhibit',
      error: error.message
    });
  }
};

// Get feeding statistics
const getFeedingStats = async (req, res) => {
  try {
    const totalFeedings = await Feeding.countDocuments();
    const completedFeedings = await Feeding.countDocuments({ completed: true });
    const pendingFeedings = await Feeding.countDocuments({ completed: false });
    
    // Group by food type
    const foodTypeStats = await Feeding.aggregate([
      {
        $group: {
          _id: '$foodType',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get today's feedings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayFeedings = await Feeding.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    const todayCompleted = await Feeding.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      completed: true
    });
    
    res.json({
      success: true,
      data: {
        totalFeedings,
        completedFeedings,
        pendingFeedings,
        completionRate: totalFeedings > 0 ? ((completedFeedings / totalFeedings) * 100).toFixed(2) : 0,
        foodTypeBreakdown: foodTypeStats,
        todayStats: {
          total: todayFeedings,
          completed: todayCompleted,
          pending: todayFeedings - todayCompleted
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching feeding stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feeding statistics',
      error: error.message
    });
  }
};

// Get feeding schedule for today
const getTodayFeedings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const feedings = await Feeding.find({
      createdAt: { $gte: today, $lt: tomorrow }
    })
    .populate('animalId', 'name species gender')
    .populate('exhibitId', 'name type')
    .sort({ scheduledTime: 1 });
    
    res.json({
      success: true,
      data: feedings
    });
  } catch (error) {
    logger.error('Error fetching today feedings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today feedings',
      error: error.message
    });
  }
};

module.exports = {
  getAllFeedings,
  getFeedingById,
  createFeeding,
  updateFeeding,
  deleteFeeding,
  markFeedingCompleted,
  getPendingFeedings,
  getFeedingsByAnimal,
  getFeedingsByExhibit,
  getFeedingStats,
  getTodayFeedings
};
