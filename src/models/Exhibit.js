const mongoose = require('mongoose');
const { Schema } = mongoose;

const environmentalControlSchema = new Schema({
  temperature: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    current: Number,
    unit: { type: String, default: 'celsius' }
  },
  humidity: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    current: Number,
    unit: { type: String, default: 'percent' }
  },
  lighting: {
    schedule: [{
      time: String,
      intensity: Number,
      color: String
    }],
    currentIntensity: Number,
    isOn: { type: Boolean, default: true }
  },
  ventilation: {
    airFlow: Number,
    filtration: String,
    isActive: { type: Boolean, default: true }
  },
  waterSystem: {
    ph: { min: Number, max: Number, current: Number },
    temperature: { min: Number, max: Number, current: Number },
    filtration: String,
    circulation: { type: Boolean, default: true }
  }
}, { timestamps: true });

const maintenanceRecordSchema = new Schema({
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ['routine', 'repair', 'cleaning', 'inspection', 'upgrade', 'emergency'],
    required: true
  },
  description: { type: String, required: true },
  performedBy: { type: String, required: true },
  duration: Number, // in hours
  cost: { type: Number, default: 0 },
  materials: [String],
  notes: String,
  nextMaintenanceDate: Date,
  photos: [String]
}, { timestamps: true });

const safetyProtocolSchema = new Schema({
  protocolName: { type: String, required: true },
  description: String,
  procedures: [String],
  emergencyContacts: [{
    name: String,
    role: String,
    phone: String
  }],
  equipment: [String],
  lastReviewDate: Date,
  nextReviewDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const exhibitSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['indoor', 'outdoor', 'aquatic', 'aviary', 'nocturnal', 'interactive', 'educational'],
    required: true
  },
  theme: {
    type: String,
    enum: ['african_savanna', 'tropical_rainforest', 'arctic_tundra', 'desert', 'ocean', 'forest', 'grassland', 'wetland', 'mountain', 'urban'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  capacity: {
    visitors: { type: Number, required: true },
    animals: { type: Number, required: true }
  },
  currentOccupancy: {
    visitors: { type: Number, default: 0 },
    animals: { type: Number, default: 0 }
  },
  size: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    area: { type: Number, required: true },
    unit: { type: String, default: 'square_meters' }
  },
  location: {
    building: String,
    floor: Number,
    coordinates: {
      x: Number,
      y: Number,
      z: Number
    },
    gpsCoordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  accessibility: {
    wheelchairAccessible: { type: Boolean, default: true },
    audioGuide: { type: Boolean, default: false },
    brailleSigns: { type: Boolean, default: false },
    tactileElements: { type: Boolean, default: false },
    quietHours: [String]
  },
  features: [String],
  environmentalControls: environmentalControlSchema,
  maintenanceRecords: [maintenanceRecordSchema],
  safetyProtocols: [safetyProtocolSchema],
  animals: [{ type: Schema.Types.ObjectId, ref: 'Animal' }],
  staff: [{
    employeeId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    role: String,
    assignedDate: { type: Date, default: Date.now }
  }],
  operatingHours: {
    open: { type: String, required: true },
    close: { type: String, required: true },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  admissionFee: {
    adult: { type: Number, required: true },
    child: { type: Number, required: true },
    senior: { type: Number, required: true },
    group: { type: Number, required: true }
  },
  educationalContent: {
    informationPanels: [String],
    interactiveDisplays: [String],
    audioGuides: [String],
    guidedTours: { type: Boolean, default: false },
    tourSchedule: [String]
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'maintenance', 'renovation', 'emergency'],
    default: 'open'
  },
  lastInspection: Date,
  nextInspection: Date,
  photos: [String],
  videos: [String],
  virtualTour: String,
  socialMedia: {
    hashtags: [String],
    instagram: String,
    facebook: String,
    twitter: String
  },
  notes: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for occupancy percentage
exhibitSchema.virtual('visitorOccupancyPercentage').get(function() {
  if (this.capacity.visitors === 0) return 0;
  return Math.round((this.currentOccupancy.visitors / this.capacity.visitors) * 100);
});

exhibitSchema.virtual('animalOccupancyPercentage').get(function() {
  if (this.capacity.animals === 0) return 0;
  return Math.round((this.currentOccupancy.animals / this.capacity.animals) * 100);
});

// Indexes
exhibitSchema.index({ name: 1 });
exhibitSchema.index({ type: 1 });
exhibitSchema.index({ theme: 1 });
exhibitSchema.index({ status: 1 });
exhibitSchema.index({ 'location.building': 1 });
exhibitSchema.index({ isActive: 1 });
exhibitSchema.index({ createdAt: -1 });

// Pre-save middleware
exhibitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update animal count
  this.currentOccupancy.animals = this.animals.length;
  
  // Calculate next inspection date (6 months from last inspection)
  if (this.lastInspection) {
    const nextInspection = new Date(this.lastInspection);
    nextInspection.setMonth(nextInspection.getMonth() + 6);
    this.nextInspection = nextInspection;
  }
  
  next();
});

// Instance methods
exhibitSchema.methods.addAnimal = function(animalId) {
  if (!this.animals.includes(animalId)) {
    this.animals.push(animalId);
    this.currentOccupancy.animals = this.animals.length;
  }
  return this.save();
};

exhibitSchema.methods.removeAnimal = function(animalId) {
  this.animals = this.animals.filter(id => !id.equals(animalId));
  this.currentOccupancy.animals = this.animals.length;
  return this.save();
};

exhibitSchema.methods.addMaintenanceRecord = function(record) {
  this.maintenanceRecords.push(record);
  return this.save();
};

exhibitSchema.methods.isOpen = function() {
  if (this.status !== 'open') return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  return this.operatingHours.days.includes(currentDay) &&
         currentTime >= this.operatingHours.open &&
         currentTime <= this.operatingHours.close;
};

exhibitSchema.methods.getMaintenanceDue = function() {
  if (!this.nextInspection) return false;
  return new Date() >= this.nextInspection;
};

// Static methods
exhibitSchema.statics.findByType = function(type) {
  return this.find({ type: type, isActive: true });
};

exhibitSchema.statics.findByTheme = function(theme) {
  return this.find({ theme: theme, isActive: true });
};

exhibitSchema.statics.findOpenExhibits = function() {
  return this.find({ status: 'open', isActive: true });
};

exhibitSchema.statics.getExhibitStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCapacity: { $sum: '$capacity.visitors' },
        averageOccupancy: { $avg: '$currentOccupancy.visitors' },
        totalAnimals: { $sum: '$currentOccupancy.animals' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Exhibit', exhibitSchema);
