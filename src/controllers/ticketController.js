const Ticket = require('../models/Ticket');
const Visitor = require('../models/Visitor');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

// Get all tickets with pagination and filtering
const getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.visitorId) filter.visitorId = req.query.visitorId;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.isUsed !== undefined) filter.isUsed = req.query.isUsed === 'true';
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.visitDate) {
      const visitDate = new Date(req.query.visitDate);
      filter.visitDate = {
        $gte: new Date(visitDate.setHours(0, 0, 0, 0)),
        $lt: new Date(visitDate.setHours(23, 59, 59, 999))
      };
    }
    
    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.purchaseDate = -1;
    }
    
    const tickets = await Ticket.find(filter)
      .populate('visitorId', 'firstName lastName email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Ticket.countDocuments(filter);
    
    res.json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('visitorId', 'firstName lastName email phone address');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    logger.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

// Get ticket by ticket ID
const getTicketByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findOne({ ticketId })
      .populate('visitorId', 'firstName lastName email phone');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    logger.error('Error fetching ticket by ticket ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

// Create new ticket (purchase)
const createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    // Verify visitor exists
    const visitor = await Visitor.findById(req.body.visitorId);
    if (!visitor) {
      return res.status(400).json({
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
    
    const ticket = new Ticket(ticketData);
    await ticket.save();
    
    // Send ticket confirmation email
    try {
      await emailService.sendTicketConfirmationEmail(visitor, ticket);
    } catch (emailError) {
      logger.error('Failed to send ticket confirmation email:', emailError);
    }
    
    logger.info(`Ticket purchased: ${ticketId} for visitor ${visitor.fullName}`);
    
    res.status(201).json({
      success: true,
      message: 'Ticket purchased successfully',
      data: ticket
    });
  } catch (error) {
    logger.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Don't allow updating used tickets
    if (ticket.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update used ticket'
      });
    }
    
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('visitorId', 'firstName lastName email');
    
    logger.info(`Ticket updated: ${updatedTicket.ticketId}`);
    
    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    logger.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: error.message
    });
  }
};

// Delete ticket
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Don't allow deleting used tickets
    if (ticket.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete used ticket'
      });
    }
    
    await Ticket.findByIdAndDelete(req.params.id);
    
    logger.info(`Ticket deleted: ${ticket.ticketId}`);
    
    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting ticket',
      error: error.message
    });
  }
};

// Validate and use ticket
const validateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findOne({ ticketId })
      .populate('visitorId', 'firstName lastName email phone');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
        valid: false
      });
    }
    
    // Check if ticket is already used
    if (ticket.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Ticket has already been used',
        valid: false,
        usedAt: ticket.usedAt
      });
    }
    
    // Check if ticket is valid for today
    const today = new Date();
    const visitDate = new Date(ticket.visitDate);
    
    if (visitDate.toDateString() !== today.toDateString()) {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not valid for today',
        valid: false,
        visitDate: ticket.visitDate
      });
    }
    
    // Mark ticket as used
    ticket.isUsed = true;
    ticket.usedAt = new Date();
    await ticket.save();
    
    logger.info(`Ticket validated and used: ${ticketId}`);
    
    res.json({
      success: true,
      message: 'Ticket validated successfully',
      valid: true,
      data: ticket
    });
  } catch (error) {
    logger.error('Error validating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating ticket',
      error: error.message
    });
  }
};

// Get tickets by visitor
const getTicketsByVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;
    
    const tickets = await Ticket.find({ visitorId })
      .sort({ purchaseDate: -1 });
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    logger.error('Error fetching tickets by visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets by visitor',
      error: error.message
    });
  }
};

// Get ticket statistics
const getTicketStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const usedTickets = await Ticket.countDocuments({ isUsed: true });
    const unusedTickets = await Ticket.countDocuments({ isUsed: false });
    
    // Calculate total revenue
    const revenueStats = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);
    
    // Group by ticket type
    const typeStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          used: { $sum: { $cond: [{ $eq: ['$isUsed', true] }, 1, 0] } },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Group by payment method
    const paymentMethodStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get today's ticket sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTickets = await Ticket.countDocuments({
      purchaseDate: { $gte: today, $lt: tomorrow }
    });
    
    const todayRevenue = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$price' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalTickets,
        usedTickets,
        unusedTickets,
        usageRate: totalTickets > 0 ? ((usedTickets / totalTickets) * 100).toFixed(2) : 0,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        averagePrice: revenueStats[0]?.averagePrice || 0,
        typeBreakdown: typeStats,
        paymentMethodBreakdown: paymentMethodStats,
        todayStats: {
          tickets: todayTickets,
          revenue: todayRevenue[0]?.revenue || 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching ticket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket statistics',
      error: error.message
    });
  }
};

// Get tickets for today
const getTodayTickets = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tickets = await Ticket.find({
      visitDate: { $gte: today, $lt: tomorrow }
    })
    .populate('visitorId', 'firstName lastName email phone')
    .sort({ purchaseDate: -1 });
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    logger.error('Error fetching today tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today tickets',
      error: error.message
    });
  }
};

// Search tickets
const searchTickets = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const tickets = await Ticket.find({
      $or: [
        { ticketId: new RegExp(query, 'i') },
        { transactionId: new RegExp(query, 'i') },
        { type: new RegExp(query, 'i') }
      ]
    })
    .populate('visitorId', 'firstName lastName email')
    .sort({ purchaseDate: -1 })
    .limit(20);
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    logger.error('Error searching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching tickets',
      error: error.message
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  getTicketByTicketId,
  createTicket,
  updateTicket,
  deleteTicket,
  validateTicket,
  getTicketsByVisitor,
  getTicketStats,
  getTodayTickets,
  searchTickets
};
