const Exhibit = require('../models/Exhibit');
const Animal = require('../models/Animal');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get all exhibits with pagination and filtering
const getAllExhibits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.theme) filter.theme = req.query.theme;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    
    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.createdAt = -1;
    }
    
    const exhibits = await Exhibit.find(filter)
      .populate('animals', 'name species gender')
      .populate('staff.employeeId', 'firstName lastName role')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Exhibit.countDocuments(filter);
    
    res.json({
      success: true,
      data: exhibits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching exhibits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exhibits',
      error: error.message
    });
  }
};

// Get exhibit by ID
const getExhibitById = async (req, res) => {
  try {
    const exhibit = await Exhibit.findById(req.params.id)
      .populate('animals', 'name species gender status physicalDescription')
      .populate('staff.employeeId', 'firstName lastName role department');
    
    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: 'Exhibit not found'
      });
    }
    
    res.json({
      success: true,
      data: exhibit
    });
  } catch (error) {
    logger.error('Error fetching exhibit:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exhibit',
      error: error.message
    });
  }
};

// Create new exhibit
const createExhibit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const exhibit = new Exhibit(req.body);
    await exhibit.save();
    
    logger.info(`New exhibit created: ${exhibit.name} (${exhibit.type})`);
    
    res.status(201).json({
      success: true,
      message: 'Exhibit created successfully',
      data: exhibit
    });
  } catch (error) {
    logger.error('Error creating exhibit:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating exhibit',
      error: error.message
    });
  }
};

// Update exhibit
const updateExhibit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const exhibit = await Exhibit.findById(req.params.id);
    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: 'Exhibit not found'
      });
    }
    
    const updatedExhibit = await Exhibit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('animals', 'name species gender');
    
    logger.info(`Exhibit updated: ${updatedExhibit.name}`);
    
    res.json({
      success: true,
      message: 'Exhibit updated successfully',
      data: updatedExhibit
    });
  } catch (error) {
    logger.error('Error updating exhibit:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating exhibit',
      error: error.message
    });
  }
};

// Delete exhibit
const deleteExhibit = async (req, res) => {
  try {
    const exhibit = await Exhibit.findById(req.params.id);
    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: 'Exhibit not found'
      });
    }
    
    // Check if exhibit has animals
    if (exhibit.animals && exhibit.animals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete exhibit with animals. Please relocate animals first.'
      });
    }
    
    await Exhibit.findByIdAndDelete(req.params.id);
    
    logger.info(`Exhibit deleted: ${exhibit.name}`);
    
    res.json({
      success: true,
      message: 'Exhibit deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting exhibit:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting exhibit',
      error: error.message
    });
  }
};

// Add maintenance record
const addMaintenanceRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const exhibit = await Exhibit.findById(req.params.id);
    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: 'Exhibit not found'
      });
    }
    
    await exhibit.addMaintenanceRecord(req.body);
    
    logger.info(`Maintenance record added for exhibit: ${exhibit.name}`);
    
    res.json({
      success: true,
      message: 'Maintenance record added successfully',
      data: exhibit.maintenanceRecords[exhibit.maintenanceRecords.length - 1]
    });
  } catch (error) {
    logger.error('Error adding maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding maintenance record',
      error: error.message
    });
  }
};

// Update environmental controls
const updateEnvironmentalControls = async (req, res) => {
  try {
    const exhibit = await Exhibit.findById(req.params.id);
    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: 'Exhibit not found'
      });
    }
    
    exhibit.environmentalControls = {
      ...exhibit.environmentalControls,
      ...req.body
    };
    
    await exhibit.save();
    
    logger.info(`Environmental controls updated for exhibit: ${exhibit.name}`);
    
    res.json({
      success: true,
      message: 'Environmental controls updated successfully',
      data: exhibit.environmentalControls
    });
  } catch (error) {
    logger.error('Error updating environmental controls:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating environmental controls',
      error: error.message
    });
  }
};

// Get exhibit statistics
const getExhibitStats = async (req, res) => {
  try {
    const stats = await Exhibit.getExhibitStats();
    
    const totalExhibits = await Exhibit.countDocuments();
    const openExhibits = await Exhibit.countDocuments({ status: 'open' });
    const closedExhibits = await Exhibit.countDocuments({ status: 'closed' });
    const maintenanceExhibits = await Exhibit.countDocuments({ status: 'maintenance' });
    
    const totalCapacity = await Exhibit.aggregate([
      { $group: { _id: null, total: { $sum: '$capacity.visitors' } } }
    ]);
    
    const currentOccupancy = await Exhibit.aggregate([
      { $group: { _id: null, total: { $sum: '$currentOccupancy.visitors' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalExhibits,
        openExhibits,
        closedExhibits,
        maintenanceExhibits,
        totalCapacity: totalCapacity[0]?.total || 0,
        currentOccupancy: currentOccupancy[0]?.total || 0,
        typeBreakdown: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching exhibit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exhibit statistics',
      error: error.message
    });
  }
};

// Search exhibits
const searchExhibits = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const exhibits = await Exhibit.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { type: new RegExp(query, 'i') },
        { theme: new RegExp(query, 'i') }
      ]
    })
    .populate('animals', 'name species')
    .limit(20);
    
    res.json({
      success: true,
      data: exhibits
    });
  } catch (error) {
    logger.error('Error searching exhibits:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching exhibits',
      error: error.message
    });
  }
};

// Get exhibit by type
const getExhibitsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const exhibits = await Exhibit.findByType(type);
    
    res.json({
      success: true,
      data: exhibits
    });
  } catch (error) {
    logger.error('Error fetching exhibits by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exhibits by type',
      error: error.message
    });
  }
};

// Get exhibit by theme
const getExhibitsByTheme = async (req, res) => {
  try {
    const { theme } = req.params;
    
    const exhibits = await Exhibit.findByTheme(theme);
    
    res.json({
      success: true,
      data: exhibits
    });
  } catch (error) {
    logger.error('Error fetching exhibits by theme:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exhibits by theme',
      error: error.message
    });
  }
};

// Assign staff to exhibit
const assignStaff = async (req, res) => {
  try {
    const { staffId, role } = req.body;
    
    const exhibit = await Exhibit.findById(req.params.id);
    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: 'Exhibit not found'
      });
    }
    
    // Check if staff is already assigned
    const staffExists = exhibit.staff.some(s => s.employeeId.toString() === staffId);
    if (staffExists) {
      return res.status(400).json({
        success: false,
        message: 'Staff member is already assigned to this exhibit'
      });
    }
    
    exhibit.staff.push({
      employeeId: staffId,
      role: role,
      assignedDate: new Date()
    });
    
    await exhibit.save();
    
    logger.info(`Staff assigned to exhibit: ${exhibit.name}`);
    
    res.json({
      success: true,
      message: 'Staff assigned successfully',
      data: exhibit
    });
  } catch (error) {
    logger.error('Error assigning staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning staff',
      error: error.message
    });
  }
};

// Remove staff from exhibit
const removeStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const exhibit = await Exhibit.findById(req.params.id);
    if (!exhibit) {
      return res.status(404).json({
        success: false,
        message: 'Exhibit not found'
      });
    }
    
    exhibit.staff = exhibit.staff.filter(s => s.employeeId.toString() !== staffId);
    await exhibit.save();
    
    logger.info(`Staff removed from exhibit: ${exhibit.name}`);
    
    res.json({
      success: true,
      message: 'Staff removed successfully',
      data: exhibit
    });
  } catch (error) {
    logger.error('Error removing staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing staff',
      error: error.message
    });
  }
};

module.exports = {
  getAllExhibits,
  getExhibitById,
  createExhibit,
  updateExhibit,
  deleteExhibit,
  addMaintenanceRecord,
  updateEnvironmentalControls,
  getExhibitStats,
  searchExhibits,
  getExhibitsByType,
  getExhibitsByTheme,
  assignStaff,
  removeStaff
};
