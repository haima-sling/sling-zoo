const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicationSchema = new Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: String,
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  administeredBy: String
});

const healthRecordSchema = new Schema({
  animalId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Animal',
    required: true
  },
  animalName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  veterinarian: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['checkup', 'vaccination', 'treatment', 'surgery', 'emergency', 'follow_up'],
    default: 'checkup'
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatment: {
    type: String,
    required: true,
    trim: true
  },
  medication: [medicationSchema],
  vitals: {
    temperature: Number,
    weight: Number,
    heartRate: Number,
    respiratoryRate: Number,
    bloodPressure: String
  },
  labResults: [{
    testName: String,
    result: String,
    referenceRange: String,
    date: Date
  }],
  notes: String,
  cost: { type: Number, default: 0 },
  followUpDate: Date,
  followUpRequired: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'pending_followup'],
    default: 'completed'
  },
  photos: [String],
  documents: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
healthRecordSchema.index({ animalId: 1 });
healthRecordSchema.index({ date: -1 });
healthRecordSchema.index({ veterinarian: 1 });
healthRecordSchema.index({ type: 1 });
healthRecordSchema.index({ status: 1 });
healthRecordSchema.index({ followUpDate: 1 });
healthRecordSchema.index({ createdAt: -1 });

// Instance methods
healthRecordSchema.methods.addMedication = function(medicationData) {
  this.medication.push(medicationData);
  return this.save();
};

healthRecordSchema.methods.addLabResult = function(labData) {
  if (!this.labResults) this.labResults = [];
  this.labResults.push(labData);
  return this.save();
};

healthRecordSchema.methods.scheduleFollowUp = function(followUpDate) {
  this.followUpDate = followUpDate;
  this.followUpRequired = true;
  this.status = 'pending_followup';
  return this.save();
};

// Static methods
healthRecordSchema.statics.getRecordsByAnimal = function(animalId) {
  return this.find({ animalId }).sort({ date: -1 });
};

healthRecordSchema.statics.getRecentRecords = function(months = 6) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  return this.find({ date: { $gte: cutoffDate } }).sort({ date: -1 });
};

healthRecordSchema.statics.getRecordsByVeterinarian = function(veterinarian) {
  return this.find({ veterinarian: new RegExp(veterinarian, 'i') }).sort({ date: -1 });
};

healthRecordSchema.statics.getFollowUpsDue = function() {
  const today = new Date();
  return this.find({
    followUpRequired: true,
    followUpDate: { $lte: today },
    status: 'pending_followup'
  }).sort({ followUpDate: 1 });
};

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
