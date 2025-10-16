const HealthRecord = require('../models/HealthRecord');
const Animal = require('../models/Animal');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get all health records with pagination and filtering
const getAllHealthRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.animalId) filter.animalId = req.query.animalId;
    if (req.query.veterinarian) filter.veterinarian = new RegExp(req.query.veterinarian, 'i');
    if (req.query.diagnosis) filter.diagnosis = new RegExp(req.query.diagnosis, 'i');
    if (req.query.treatment) filter.treatment = new RegExp(req.query.treatment, 'i');
    
    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.date = -1;
    }
    
    const healthRecords = await HealthRecord.find(filter)
      .populate('animalId', 'name species gender birthDate')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await HealthRecord.countDocuments(filter);
    
    res.json({
      success: true,
      data: healthRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching health records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health records',
      error: error.message
    });
  }
};

// Get health record by ID
const getHealthRecordById = async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id)
      .populate('animalId', 'name species gender birthDate exhibitId');
    
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }
    
    res.json({
      success: true,
      data: healthRecord
    });
  } catch (error) {
    logger.error('Error fetching health record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health record',
      error: error.message
    });
  }
};

// Create new health record
const createHealthRecord = async (req, res) => {
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
    
    // Add animal name
    req.body.animalName = animal.name;
    
    const healthRecord = new HealthRecord(req.body);
    await healthRecord.save();
    
    // Update animal's last health check date
    animal.lastHealthCheck = healthRecord.date;
    await animal.save();
    
    logger.info(`New health record created for animal: ${animal.name}`);
    
    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: healthRecord
    });
  } catch (error) {
    logger.error('Error creating health record:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating health record',
      error: error.message
    });
  }
};

// Update health record
const updateHealthRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const healthRecord = await HealthRecord.findById(req.params.id);
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }
    
    const updatedHealthRecord = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('animalId', 'name species');
    
    logger.info(`Health record updated for animal: ${updatedHealthRecord.animalName}`);
    
    res.json({
      success: true,
      message: 'Health record updated successfully',
      data: updatedHealthRecord
    });
  } catch (error) {
    logger.error('Error updating health record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating health record',
      error: error.message
    });
  }
};

// Delete health record
const deleteHealthRecord = async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }
    
    await HealthRecord.findByIdAndDelete(req.params.id);
    
    logger.info(`Health record deleted for animal: ${healthRecord.animalName}`);
    
    res.json({
      success: true,
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting health record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting health record',
      error: error.message
    });
  }
};

// Get health records by animal
const getHealthRecordsByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;
    
    const healthRecords = await HealthRecord.find({ animalId })
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: healthRecords
    });
  } catch (error) {
    logger.error('Error fetching health records by animal:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health records by animal',
      error: error.message
    });
  }
};

// Get health records by veterinarian
const getHealthRecordsByVeterinarian = async (req, res) => {
  try {
    const { veterinarian } = req.params;
    
    const healthRecords = await HealthRecord.find({ 
      veterinarian: new RegExp(veterinarian, 'i') 
    })
    .populate('animalId', 'name species gender')
    .sort({ date: -1 });
    
    res.json({
      success: true,
      data: healthRecords
    });
  } catch (error) {
    logger.error('Error fetching health records by veterinarian:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health records by veterinarian',
      error: error.message
    });
  }
};

// Get health statistics
const getHealthStats = async (req, res) => {
  try {
    const totalRecords = await HealthRecord.countDocuments();
    
    // Get records from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = await HealthRecord.countDocuments({
      date: { $gte: thirtyDaysAgo }
    });
    
    // Get total cost
    const costStats = await HealthRecord.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          averageCost: { $avg: '$cost' }
        }
      }
    ]);
    
    // Group by veterinarian
    const veterinarianStats = await HealthRecord.aggregate([
      {
        $group: {
          _id: '$veterinarian',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Group by diagnosis
    const diagnosisStats = await HealthRecord.aggregate([
      {
        $group: {
          _id: '$diagnosis',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get animals due for health check
    const animalsDueForCheck = await Animal.countDocuments({
      nextHealthCheck: { $lte: new Date() }
    });
    
    res.json({
      success: true,
      data: {
        totalRecords,
        recentRecords,
        totalCost: costStats[0]?.totalCost || 0,
        averageCost: costStats[0]?.averageCost || 0,
        veterinarianBreakdown: veterinarianStats,
        commonDiagnoses: diagnosisStats,
        animalsDueForCheck
      }
    });
  } catch (error) {
    logger.error('Error fetching health stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health statistics',
      error: error.message
    });
  }
};

// Get animals due for health check
const getAnimalsDueForHealthCheck = async (req, res) => {
  try {
    const animals = await Animal.find({
      nextHealthCheck: { $lte: new Date() }
    })
    .populate('exhibitId', 'name type')
    .sort({ nextHealthCheck: 1 });
    
    res.json({
      success: true,
      data: animals
    });
  } catch (error) {
    logger.error('Error fetching animals due for health check:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching animals due for health check',
      error: error.message
    });
  }
};

// Search health records
const searchHealthRecords = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const healthRecords = await HealthRecord.find({
      $or: [
        { animalName: new RegExp(query, 'i') },
        { veterinarian: new RegExp(query, 'i') },
        { diagnosis: new RegExp(query, 'i') },
        { treatment: new RegExp(query, 'i') },
        { 'medication.name': new RegExp(query, 'i') }
      ]
    })
    .populate('animalId', 'name species gender')
    .sort({ date: -1 })
    .limit(20);
    
    res.json({
      success: true,
      data: healthRecords
    });
  } catch (error) {
    logger.error('Error searching health records:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching health records',
      error: error.message
    });
  }
};

module.exports = {
  getAllHealthRecords,
  getHealthRecordById,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthRecordsByAnimal,
  getHealthRecordsByVeterinarian,
  getHealthStats,
  getAnimalsDueForHealthCheck,
  searchHealthRecords
};
