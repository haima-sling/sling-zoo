const Visitor = require('../models/Visitor');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const moment = require('moment');

// Get all visitors with pagination and filtering
const getAllVisitors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.isVip !== undefined) filter.isVip = req.query.isVip === 'true';
    if (req.query.membershipType) filter['membership.type'] = req.query.membershipType;
    if (req.query.vipLevel) filter.vipLevel = req.query.vipLevel;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    
    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.createdAt = -1;
    }
    
    const visitors = await Visitor.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Visitor.countDocuments(filter);
    
    res.json({
      success: true,
      data: visitors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching visitors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitors',
      error: error.message
    });
  }
};

// Get visitor by ID
const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }
    
    res.json({
      success: true,
      data: visitor
    });
  } catch (error) {
    logger.error('Error fetching visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitor',
      error: error.message
    });
  }
};

// Create new visitor
const createVisitor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    // Check if visitor already exists
    const existingVisitor = await Visitor.findByEmail(req.body.email);
    if (existingVisitor) {
      return res.status(400).json({
        success: false,
        message: 'Visitor with this email already exists'
      });
    }
    
    const visitor = new Visitor(req.body);
    await visitor.save();
    
    logger.info(`New visitor registered: ${visitor.fullName} (${visitor.email})`);
    
    res.status(201).json({
      success: true,
      message: 'Visitor created successfully',
      data: visitor
    });
  } catch (error) {
    logger.error('Error creating visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating visitor',
      error: error.message
    });
  }
};

// Update visitor
const updateVisitor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== visitor.email) {
      const existingVisitor = await Visitor.findByEmail(req.body.email);
      if (existingVisitor) {
        return res.status(400).json({
          success: false,
          message: 'Visitor with this email already exists'
        });
      }
    }
    
    const updatedVisitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    logger.info(`Visitor updated: ${updatedVisitor.fullName} (${updatedVisitor.email})`);
    
    res.json({
      success: true,
      message: 'Visitor updated successfully',
      data: updatedVisitor
    });
  } catch (error) {
    logger.error('Error updating visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating visitor',
      error: error.message
    });
  }
};

// Delete visitor
const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }
    
    await Visitor.findByIdAndDelete(req.params.id);
    
    logger.info(`Visitor deleted: ${visitor.fullName} (${visitor.email})`);
    
    res.json({
      success: true,
      message: 'Visitor deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting visitor',
      error: error.message
    });
  }
};

// Purchase ticket
const purchaseTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }
    
    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const ticketData = {
      ...req.body,
      ticketId,
      purchaseDate: new Date()
    };
    
    await visitor.purchaseTicket(ticketData);
    
    logger.info(`Ticket purchased for visitor: ${visitor.fullName}, Ticket ID: ${ticketId}`);
    
    res.json({
      success: true,
      message: 'Ticket purchased successfully',
      data: {
        ticketId,
        visitor: visitor.fullName,
        ticket: ticketData
      }
    });
  } catch (error) {
    logger.error('Error purchasing ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing ticket',
      error: error.message
    });
  }
};

// Record visit
const recordVisit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }
    
    const visitData = {
      ...req.body,
      visitDate: new Date()
    };
    
    await visitor.addVisit(visitData);
    
    logger.info(`Visit recorded for visitor: ${visitor.fullName}`);
    
    res.json({
      success: true,
      message: 'Visit recorded successfully',
      data: visitData
    });
  } catch (error) {
    logger.error('Error recording visit:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording visit',
      error: error.message
    });
  }
};

// Add loyalty points
const addLoyaltyPoints = async (req, res) => {
  try {
    const { points, reason } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid points amount is required'
      });
    }
    
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }
    
    await visitor.addLoyaltyPoints(points);
    
    logger.info(`Loyalty points added to visitor: ${visitor.fullName}, Points: ${points}, Reason: ${reason || 'N/A'}`);
    
    res.json({
      success: true,
      message: 'Loyalty points added successfully',
      data: {
        visitor: visitor.fullName,
        pointsAdded: points,
        totalPoints: visitor.loyaltyPoints,
        reason
      }
    });
  } catch (error) {
    logger.error('Error adding loyalty points:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding loyalty points',
      error: error.message
    });
  }
};

// Get visitor statistics
const getVisitorStats = async (req, res) => {
  try {
    const stats = await Visitor.getVisitorStats();
    
    const vipVisitors = await Visitor.findVipVisitors();
    const activeMembers = await Visitor.findActiveMembers();
    
    // Get recent visitors (last 30 days)
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const recentVisitors = await Visitor.countDocuments({
      lastVisitDate: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      data: {
        ...stats[0],
        vipVisitors: vipVisitors.length,
        activeMembers: activeMembers.length,
        recentVisitors
      }
    });
  } catch (error) {
    logger.error('Error fetching visitor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitor statistics',
      error: error.message
    });
  }
};

// Search visitors
const searchVisitors = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const visitors = await Visitor.find({
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { phone: new RegExp(query, 'i') }
      ]
    })
    .limit(20);
    
    res.json({
      success: true,
      data: visitors
    });
  } catch (error) {
    logger.error('Error searching visitors:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching visitors',
      error: error.message
    });
  }
};

// Get visitor by email
const getVisitorByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const visitor = await Visitor.findByEmail(email);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }
    
    res.json({
      success: true,
      data: visitor
    });
  } catch (error) {
    logger.error('Error fetching visitor by email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitor',
      error: error.message
    });
  }
};

module.exports = {
  getAllVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  purchaseTicket,
  recordVisit,
  addLoyaltyPoints,
  getVisitorStats,
  searchVisitors,
  getVisitorByEmail
};
