const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
  ticketId: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  visitorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Visitor',
    required: true
  },
  type: {
    type: String,
    enum: ['adult', 'child', 'senior', 'student', 'group', 'annual_pass', 'vip'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  visitDate: {
    type: Date,
    required: true
  },
  validUntil: Date,
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: Date,
  discountApplied: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountCode: String,
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'online', 'voucher', 'complimentary'],
    required: true
  },
  transactionId: String,
  qrCode: String,
  barcode: String,
  notes: String,
  refunded: {
    type: Boolean,
    default: false
  },
  refundDate: Date,
  refundAmount: Number,
  refundReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for final price
ticketSchema.virtual('finalPrice').get(function() {
  if (this.discountApplied > 0) {
    return this.price * (1 - this.discountApplied / 100);
  }
  return this.price;
});

// Virtual for ticket validity status
ticketSchema.virtual('isValid').get(function() {
  if (this.isUsed) return false;
  if (this.refunded) return false;
  if (this.validUntil && new Date() > this.validUntil) return false;
  return true;
});

// Indexes
ticketSchema.index({ ticketId: 1 }, { unique: true });
ticketSchema.index({ visitorId: 1 });
ticketSchema.index({ type: 1 });
ticketSchema.index({ purchaseDate: -1 });
ticketSchema.index({ visitDate: 1 });
ticketSchema.index({ isUsed: 1 });
ticketSchema.index({ transactionId: 1 });
ticketSchema.index({ createdAt: -1 });

// Instance methods
ticketSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.usedAt = new Date();
  return this.save();
};

ticketSchema.methods.refund = function(reason) {
  this.refunded = true;
  this.refundDate = new Date();
  this.refundAmount = this.finalPrice;
  this.refundReason = reason;
  return this.save();
};

// Static methods
ticketSchema.statics.findByTicketId = function(ticketId) {
  return this.findOne({ ticketId: ticketId.toUpperCase() });
};

ticketSchema.statics.findByVisitor = function(visitorId) {
  return this.find({ visitorId }).sort({ purchaseDate: -1 });
};

ticketSchema.statics.getTodayTickets = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    visitDate: { $gte: today, $lt: tomorrow }
  });
};

ticketSchema.statics.getUnusedTickets = function() {
  return this.find({
    isUsed: false,
    refunded: false,
    visitDate: { $gte: new Date() }
  });
};

module.exports = mongoose.model('Ticket', ticketSchema);
