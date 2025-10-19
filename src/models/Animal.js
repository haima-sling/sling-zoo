const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicalRecordSchema = new Schema({
  date: { type: Date, required: true },
  veterinarian: { type: String, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  medication: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  notes: String,
  followUpDate: Date,
  cost: { type: Number, default: 0 }
}, { timestamps: true });

const feedingScheduleSchema = new Schema({
  time: { type: String, required: true },
  foodType: { type: String, required: true },
  quantity: { type: String, required: true },
  specialInstructions: String,
  completed: { type: Boolean, default: false },
  completedBy: String,
  completedAt: Date
});

const breedingRecordSchema = new Schema({
  mateId: { type: Schema.Types.ObjectId, ref: 'Animal' },
  breedingDate: { type: Date, required: true },
  expectedBirthDate: Date,
  actualBirthDate: Date,
  offspring: [{
    name: String,
    birthWeight: Number,
    gender: { type: String, enum: ['male', 'female', 'unknown'] },
    status: { type: String, enum: ['alive', 'deceased', 'transferred'] }
  }],
  notes: String
}, { timestamps: true });

const animalSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  species: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  scientificName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  gender: { 
    type: String, 
    required: true,
    enum: ['male', 'female', 'unknown']
  },
  birthDate: { 
    type: Date, 
    required: true
  },
  arrivalDate: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  origin: {
    type: String,
    enum: ['wild', 'captive_bred', 'rescue', 'transfer', 'donation'],
    required: true
  },
  exhibitId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Exhibit',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'quarantine', 'medical_treatment', 'breeding', 'retired', 'deceased'],
    default: 'active'
  },
  physicalDescription: {
    weight: Number,
    height: Number,
    length: Number,
    color: String,
    markings: String,
    distinguishingFeatures: String
  },
  temperament: {
    type: String,
    enum: ['docile', 'aggressive', 'shy', 'playful', 'territorial', 'social'],
    default: 'docile'
  },
  diet: {
    primary: { type: String, required: true },
    secondary: [String],
    restrictions: [String],
    feedingFrequency: { type: String, required: true },
    specialRequirements: String
  },
  medicalRecords: [medicalRecordSchema],
  feedingSchedule: [feedingScheduleSchema],
  breedingRecords: [breedingRecordSchema],
  tags: [String],
  microchipId: String,
  rfidTag: String,
  photos: [String],
  notes: String,
  lastHealthCheck: Date,
  nextHealthCheck: Date,
  isEndangered: { type: Boolean, default: false },
  conservationStatus: {
    type: String,
    enum: ['least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered', 'extinct_in_wild', 'extinct']
  },
  estimatedLifespan: Number,
  currentAge: {
    type: Number,
    virtual: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating current age
animalSchema.virtual('currentAge').get(function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Indexes for better query performance
animalSchema.index({ name: 1 });
animalSchema.index({ species: 1 });
animalSchema.index({ exhibitId: 1 });
animalSchema.index({ status: 1 });
animalSchema.index({ microchipId: 1 }, { unique: true, sparse: true });
animalSchema.index({ rfidTag: 1 }, { unique: true, sparse: true });
animalSchema.index({ birthDate: 1 });
animalSchema.index({ createdAt: -1 });

// Pre-save middleware
animalSchema.pre('save', function(next) {
  // Update last health check if medical records are added
  if (this.medicalRecords && this.medicalRecords.length > 0) {
    const latestRecord = this.medicalRecords[this.medicalRecords.length - 1];
    this.lastHealthCheck = latestRecord.date;
  }
  
  // Calculate next health check (6 months from last check)
  if (this.lastHealthCheck) {
    const nextCheck = new Date(this.lastHealthCheck);
    nextCheck.setMonth(nextCheck.getMonth() + 6);
    this.nextHealthCheck = nextCheck;
  }
  
  next();
});

// Instance methods
animalSchema.methods.getAgeInMonths = function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  return (today.getFullYear() - birthDate.getFullYear()) * 12 + 
         (today.getMonth() - birthDate.getMonth());
};

animalSchema.methods.getRecentMedicalRecords = function(months = 6) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  return this.medicalRecords.filter(record => record.date >= cutoffDate);
};

animalSchema.methods.isDueForHealthCheck = function() {
  if (!this.nextHealthCheck) return false;
  return new Date() >= this.nextHealthCheck;
};

// Static methods
animalSchema.statics.findBySpecies = function(species) {
  return this.find({ species: new RegExp(species, 'i') });
};

animalSchema.statics.findByExhibit = function(exhibitId) {
  return this.find({ exhibitId }).populate('exhibitId');
};

animalSchema.statics.findEndangered = function() {
  return this.find({ isEndangered: true });
};

animalSchema.statics.getPopulationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$species',
        count: { $sum: 1 },
        males: { $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] } },
        females: { $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] } },
        averageAge: { $avg: '$currentAge' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Animal', animalSchema);
