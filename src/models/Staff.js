const mongoose = require('mongoose');
const { Schema } = mongoose;

const scheduleSchema = new Schema({
  date: { type: Date, required: true },
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'full_day'],
    required: true
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: String,
  duties: [String],
  notes: String
}, { timestamps: true });

const trainingRecordSchema = new Schema({
  trainingName: { type: String, required: true },
  trainingDate: { type: Date, required: true },
  completionDate: Date,
  trainer: String,
  duration: Number, // in hours
  score: { type: Number, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'failed'],
    default: 'scheduled'
  },
  certificate: String,
  notes: String
}, { timestamps: true });

const performanceReviewSchema = new Schema({
  reviewDate: { type: Date, required: true },
  reviewer: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  strengths: [String],
  areasForImprovement: [String],
  goals: [String],
  comments: String,
  nextReviewDate: Date
}, { timestamps: true });

const staffSchema = new Schema({
  employeeId: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
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
  role: {
    type: String,
    enum: ['admin', 'veterinarian', 'animal_care', 'maintenance', 'visitor_services', 'manager', 'security', 'education', 'conservation', 'research'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  hireDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  salaryHistory: [{
    amount: Number,
    effectiveDate: Date,
    reason: String
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  isActive: { type: Boolean, default: true },
  certifications: [String],
  specializations: [String],
  languages: [String],
  schedules: [scheduleSchema],
  trainingRecords: [trainingRecordSchema],
  performanceReviews: [performanceReviewSchema],
  avatar: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
staffSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for years of service
staffSchema.virtual('yearsOfService').get(function() {
  if (!this.hireDate) return null;
  const today = new Date();
  const hireDate = new Date(this.hireDate);
  let years = today.getFullYear() - hireDate.getFullYear();
  const monthDiff = today.getMonth() - hireDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDate.getDate())) {
    years--;
  }
  
  return years;
});

// Indexes
staffSchema.index({ employeeId: 1 }, { unique: true });
staffSchema.index({ email: 1 }, { unique: true });
staffSchema.index({ role: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ isActive: 1 });
staffSchema.index({ hireDate: 1 });
staffSchema.index({ createdAt: -1 });

// Instance methods
staffSchema.methods.addSchedule = function(scheduleData) {
  this.schedules.push(scheduleData);
  return this.save();
};

staffSchema.methods.addTrainingRecord = function(trainingData) {
  this.trainingRecords.push(trainingData);
  return this.save();
};

staffSchema.methods.addPerformanceReview = function(reviewData) {
  this.performanceReviews.push(reviewData);
  return this.save();
};

staffSchema.methods.getUpcomingSchedules = function(days = 7) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.schedules.filter(schedule => 
    schedule.date >= today && schedule.date <= futureDate
  );
};

staffSchema.methods.getAverag eRating = function() {
  if (this.performanceReviews.length === 0) return null;
  const sum = this.performanceReviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.performanceReviews.length).toFixed(2);
};

// Static methods
staffSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId: employeeId.toUpperCase() });
};

staffSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

staffSchema.statics.findByDepartment = function(department) {
  return this.find({ department, isActive: true });
};

module.exports = mongoose.model('Staff', staffSchema);
