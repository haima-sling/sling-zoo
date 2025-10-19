const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['health', 'visitor', 'financial', 'exhibit', 'staff', 'operational', 'custom'],
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  summary: String,
  recommendations: [String],
  charts: [{
    type: String,
    data: Schema.Types.Mixed,
    options: Schema.Types.Mixed
  }],
  attachments: [String],
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'pdf'
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'published', 'archived'],
    default: 'generated'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'private'
  },
  accessibleBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reportSchema.index({ type: 1 });
reportSchema.index({ period: 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ startDate: -1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ status: 1 });

// Instance methods
reportSchema.methods.publish = function() {
  this.status = 'published';
  return this.save();
};

reportSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

reportSchema.methods.addRecommendation = function(recommendation) {
  this.recommendations.push(recommendation);
  return this.save();
};

// Static methods
reportSchema.statics.findByType = function(type) {
  return this.find({ type }).sort({ createdAt: -1 });
};

reportSchema.statics.findByPeriod = function(period) {
  return this.find({ period }).sort({ createdAt: -1 });
};

reportSchema.statics.findPublished = function() {
  return this.find({ status: 'published' }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Report', reportSchema);
