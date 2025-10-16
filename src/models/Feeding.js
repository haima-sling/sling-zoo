const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedingSchema = new Schema({
  animalId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Animal',
    required: true
  },
  animalName: {
    type: String,
    required: true
  },
  exhibitId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Exhibit',
    required: true
  },
  foodType: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    required: true,
    trim: true
  },
  scheduledTime: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedBy: String,
  completedAt: Date,
  specialInstructions: String,
  notes: String,
  photos: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
feedingSchema.index({ animalId: 1 });
feedingSchema.index({ exhibitId: 1 });
feedingSchema.index({ completed: 1 });
feedingSchema.index({ scheduledTime: 1 });
feedingSchema.index({ createdAt: -1 });

// Instance methods
feedingSchema.methods.markCompleted = function(staffName, notes) {
  this.completed = true;
  this.completedBy = staffName;
  this.completedAt = new Date();
  if (notes) this.notes = notes;
  return this.save();
};

// Static methods
feedingSchema.statics.getPendingFeedings = function() {
  return this.find({ completed: false }).sort({ scheduledTime: 1 });
};

feedingSchema.statics.getFeedingsByAnimal = function(animalId) {
  return this.find({ animalId }).sort({ scheduledTime: -1 });
};

feedingSchema.statics.getTodayFeedings = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    createdAt: { $gte: today, $lt: tomorrow }
  }).sort({ scheduledTime: 1 });
};

module.exports = mongoose.model('Feeding', feedingSchema);
