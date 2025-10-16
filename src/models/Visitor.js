const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
  ticketId: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    required: true,
    enum: ['adult', 'child', 'senior', 'student', 'group', 'annual_pass', 'vip']
  },
  price: { type: Number, required: true },
  purchaseDate: { type: Date, required: true, default: Date.now },
  visitDate: { type: Date, required: true },
  validUntil: Date,
  isUsed: { type: Boolean, default: false },
  usedAt: Date,
  discountApplied: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'online', 'voucher', 'complimentary']
  },
  transactionId: String
}, { timestamps: true });

const visitHistorySchema = new Schema({
  visitDate: { type: Date, required: true },
  entryTime: Date,
  exitTime: Date,
  duration: Number, // in minutes
  exhibitsVisited: [{
    exhibitId: { type: Schema.Types.ObjectId, ref: 'Exhibit' },
    visitTime: Date,
    duration: Number
  }],
  activities: [{
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity' },
    participationTime: Date,
    rating: { type: Number, min: 1, max: 5 }
  }],
  spending: {
    food: { type: Number, default: 0 },
    souvenirs: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    suggestions: String
  },
  groupSize: { type: Number, default: 1 },
  weather: String
}, { timestamps: true });

const membershipSchema = new Schema({
  type: {
    type: String,
    enum: ['basic', 'premium', 'family', 'corporate', 'lifetime'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  benefits: [String],
  guestPasses: { type: Number, default: 0 },
  usedGuestPasses: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  autoRenewal: { type: Boolean, default: false },
  paymentMethod: String,
  lastPaymentDate: Date,
  nextPaymentDate: Date
}, { timestamps: true });

const visitorSchema = new Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  preferences: {
    interests: [String],
    accessibilityNeeds: [String],
    language: { type: String, default: 'en' },
    communicationMethod: {
      type: String,
      enum: ['email', 'sms', 'phone', 'mail'],
      default: 'email'
    },
    newsletterSubscription: { type: Boolean, default: true },
    promotionalEmails: { type: Boolean, default: false }
  },
  tickets: [ticketSchema],
  visitHistory: [visitHistorySchema],
  membership: membershipSchema,
  loyaltyPoints: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 },
  averageVisitDuration: { type: Number, default: 0 },
  favoriteExhibits: [{ type: Schema.Types.ObjectId, ref: 'Exhibit' }],
  isVip: { type: Boolean, default: false },
  vipLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  specialNeeds: [String],
  dietaryRestrictions: [String],
  allergies: [String],
  notes: String,
  isActive: { type: Boolean, default: true },
  lastVisitDate: Date,
  registrationDate: { type: Date, default: Date.now },
  source: {
    type: String,
    enum: ['website', 'walk_in', 'referral', 'social_media', 'advertisement', 'other'],
    default: 'website'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
visitorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
visitorSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Indexes
visitorSchema.index({ email: 1 });
visitorSchema.index({ phone: 1 });
visitorSchema.index({ lastName: 1, firstName: 1 });
visitorSchema.index({ 'membership.type': 1 });
visitorSchema.index({ isVip: 1 });
visitorSchema.index({ lastVisitDate: -1 });
visitorSchema.index({ totalSpent: -1 });
visitorSchema.index({ createdAt: -1 });

// Pre-save middleware
visitorSchema.pre('save', function(next) {
  // Update total visits
  this.totalVisits = this.visitHistory.length;
  
  // Update last visit date
  if (this.visitHistory.length > 0) {
    const lastVisit = this.visitHistory[this.visitHistory.length - 1];
    this.lastVisitDate = lastVisit.visitDate;
  }
  
  // Calculate average visit duration
  if (this.visitHistory.length > 0) {
    const totalDuration = this.visitHistory.reduce((sum, visit) => sum + (visit.duration || 0), 0);
    this.averageVisitDuration = Math.round(totalDuration / this.visitHistory.length);
  }
  
  // Update total spent
  this.totalSpent = this.visitHistory.reduce((sum, visit) => sum + (visit.spending.total || 0), 0);
  
  // Update VIP level based on spending
  if (this.totalSpent >= 10000) {
    this.vipLevel = 'platinum';
  } else if (this.totalSpent >= 5000) {
    this.vipLevel = 'gold';
  } else if (this.totalSpent >= 2000) {
    this.vipLevel = 'silver';
  } else if (this.totalSpent >= 500) {
    this.vipLevel = 'bronze';
  }
  
  next();
});

// Instance methods
visitorSchema.methods.addVisit = function(visitData) {
  this.visitHistory.push(visitData);
  return this.save();
};

visitorSchema.methods.purchaseTicket = function(ticketData) {
  this.tickets.push(ticketData);
  return this.save();
};

visitorSchema.methods.addLoyaltyPoints = function(points) {
  this.loyaltyPoints += points;
  return this.save();
};

visitorSchema.methods.getRecentVisits = function(months = 6) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  return this.visitHistory.filter(visit => visit.visitDate >= cutoffDate);
};

visitorSchema.methods.isMember = function() {
  return this.membership && this.membership.isActive && 
         new Date() <= this.membership.endDate;
};

// Static methods
visitorSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

visitorSchema.statics.findVipVisitors = function() {
  return this.find({ isVip: true }).sort({ totalSpent: -1 });
};

visitorSchema.statics.findActiveMembers = function() {
  return this.find({
    'membership.isActive': true,
    'membership.endDate': { $gte: new Date() }
  });
};

visitorSchema.statics.getVisitorStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: 1 },
        totalRevenue: { $sum: '$totalSpent' },
        averageSpending: { $avg: '$totalSpent' },
        averageVisits: { $avg: '$totalVisits' },
        vipCount: { $sum: { $cond: [{ $eq: ['$isVip', true] }, 1, 0] } },
        memberCount: { 
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$membership.isActive', true] },
                  { $gte: ['$membership.endDate', new Date()] }
                ]
              }, 
              1, 
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Visitor', visitorSchema);
