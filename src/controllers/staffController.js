const Staff = require('../models/Staff');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

// Get all staff with pagination and filtering
const getAllStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.position) filter.position = req.query.position;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    
    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.createdAt = -1;
    }
    
    const staff = await Staff.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Staff.countDocuments(filter);
    
    res.json({
      success: true,
      data: staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
};

// Get staff by ID
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    logger.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
};

// Create new staff
const createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    // Check if employee ID already exists
    const existingStaff = await Staff.findOne({ employeeId: req.body.employeeId });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }
    
    // Hash password if provided
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    
    const staff = new Staff(req.body);
    await staff.save();
    
    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;
    
    logger.info(`New staff member created: ${staff.firstName} ${staff.lastName} (${staff.employeeId})`);
    
    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staffResponse
    });
  } catch (error) {
    logger.error('Error creating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating staff',
      error: error.message
    });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    // Check if employee ID is being changed and if it already exists
    if (req.body.employeeId && req.body.employeeId !== staff.employeeId) {
      const existingStaff = await Staff.findOne({ employeeId: req.body.employeeId });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }
    
    // Hash password if provided
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    logger.info(`Staff member updated: ${updatedStaff.firstName} ${updatedStaff.lastName}`);
    
    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: updatedStaff
    });
  } catch (error) {
    logger.error('Error updating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff',
      error: error.message
    });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    await Staff.findByIdAndDelete(req.params.id);
    
    logger.info(`Staff member deleted: ${staff.firstName} ${staff.lastName}`);
    
    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff',
      error: error.message
    });
  }
};

// Get staff by role
const getStaffByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const staff = await Staff.find({ role, isActive: true }).select('-password');
    
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    logger.error('Error fetching staff by role:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff by role',
      error: error.message
    });
  }
};

// Get staff by department
const getStaffByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    const staff = await Staff.find({ department, isActive: true }).select('-password');
    
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    logger.error('Error fetching staff by department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff by department',
      error: error.message
    });
  }
};

// Search staff
const searchStaff = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const staff = await Staff.find({
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { employeeId: new RegExp(query, 'i') },
        { department: new RegExp(query, 'i') },
        { position: new RegExp(query, 'i') }
      ]
    })
    .select('-password')
    .limit(20);
    
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    logger.error('Error searching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching staff',
      error: error.message
    });
  }
};

// Get staff statistics
const getStaffStats = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ isActive: true });
    const inactiveStaff = await Staff.countDocuments({ isActive: false });
    
    // Group by role
    const roleStats = await Staff.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          averageSalary: { $avg: '$salary' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Group by department
    const departmentStats = await Staff.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalStaff,
        activeStaff,
        inactiveStaff,
        roleBreakdown: roleStats,
        departmentBreakdown: departmentStats
      }
    });
  } catch (error) {
    logger.error('Error fetching staff stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff statistics',
      error: error.message
    });
  }
};

// Add training record
const addTrainingRecord = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    if (!staff.trainingRecords) {
      staff.trainingRecords = [];
    }
    
    staff.trainingRecords.push(req.body);
    await staff.save();
    
    logger.info(`Training record added for staff: ${staff.firstName} ${staff.lastName}`);
    
    res.json({
      success: true,
      message: 'Training record added successfully',
      data: staff.trainingRecords[staff.trainingRecords.length - 1]
    });
  } catch (error) {
    logger.error('Error adding training record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding training record',
      error: error.message
    });
  }
};

// Add performance review
const addPerformanceReview = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    if (!staff.performanceReviews) {
      staff.performanceReviews = [];
    }
    
    staff.performanceReviews.push(req.body);
    await staff.save();
    
    logger.info(`Performance review added for staff: ${staff.firstName} ${staff.lastName}`);
    
    res.json({
      success: true,
      message: 'Performance review added successfully',
      data: staff.performanceReviews[staff.performanceReviews.length - 1]
    });
  } catch (error) {
    logger.error('Error adding performance review:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding performance review',
      error: error.message
    });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByRole,
  getStaffByDepartment,
  searchStaff,
  getStaffStats,
  addTrainingRecord,
  addPerformanceReview
};
