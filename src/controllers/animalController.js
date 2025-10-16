const Animal = require('../models/Animal');
const Exhibit = require('../models/Exhibit');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get all animals with pagination and filtering
const getAllAnimals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.species) filter.species = new RegExp(req.query.species, 'i');
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.exhibitId) filter.exhibitId = req.query.exhibitId;
    if (req.query.isEndangered !== undefined) filter.isEndangered = req.query.isEndangered === 'true';
    
    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.createdAt = -1;
    }
    
    const animals = await Animal.find(filter)
      .populate('exhibitId', 'name type theme')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Animal.countDocuments(filter);
    
    res.json({
      success: true,
      data: animals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching animals',
      error: error.message
    });
  }
};

// Get animal by ID
const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('exhibitId', 'name type theme capacity')
      .populate('breedingRecords.mateId', 'name species');
    
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }
    
    res.json({
      success: true,
      data: animal
    });
  } catch (error) {
    logger.error('Error fetching animal:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching animal',
      error: error.message
    });
  }
};

// Create new animal
const createAnimal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    // Check if exhibit exists and has capacity
    const exhibit = await Exhibit.findById(req.body.exhibitId);
    if (!exhibit) {
      return res.status(400).json({
        success: false,
        message: 'Exhibit not found'
      });
    }
    
    if (exhibit.currentOccupancy.animals >= exhibit.capacity.animals) {
      return res.status(400).json({
        success: false,
        message: 'Exhibit is at full capacity'
      });
    }
    
    const animal = new Animal(req.body);
    await animal.save();
    
    // Add animal to exhibit
    await exhibit.addAnimal(animal._id);
    
    logger.info(`New animal created: ${animal.name} (${animal.species})`);
    
    res.status(201).json({
      success: true,
      message: 'Animal created successfully',
      data: animal
    });
  } catch (error) {
    logger.error('Error creating animal:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating animal',
      error: error.message
    });
  }
};

// Update animal
const updateAnimal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }
    
    // If changing exhibit, check capacity
    if (req.body.exhibitId && req.body.exhibitId !== animal.exhibitId.toString()) {
      const newExhibit = await Exhibit.findById(req.body.exhibitId);
      if (!newExhibit) {
        return res.status(400).json({
          success: false,
          message: 'New exhibit not found'
        });
      }
      
      if (newExhibit.currentOccupancy.animals >= newExhibit.capacity.animals) {
        return res.status(400).json({
          success: false,
          message: 'New exhibit is at full capacity'
        });
      }
      
      // Remove from old exhibit and add to new exhibit
      const oldExhibit = await Exhibit.findById(animal.exhibitId);
      if (oldExhibit) {
        await oldExhibit.removeAnimal(animal._id);
      }
      await newExhibit.addAnimal(animal._id);
    }
    
    const updatedAnimal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('exhibitId', 'name type theme');
    
    logger.info(`Animal updated: ${updatedAnimal.name} (${updatedAnimal.species})`);
    
    res.json({
      success: true,
      message: 'Animal updated successfully',
      data: updatedAnimal
    });
  } catch (error) {
    logger.error('Error updating animal:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating animal',
      error: error.message
    });
  }
};

// Delete animal
const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }
    
    // Remove from exhibit
    const exhibit = await Exhibit.findById(animal.exhibitId);
    if (exhibit) {
      await exhibit.removeAnimal(animal._id);
    }
    
    await Animal.findByIdAndDelete(req.params.id);
    
    logger.info(`Animal deleted: ${animal.name} (${animal.species})`);
    
    res.json({
      success: true,
      message: 'Animal deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting animal:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting animal',
      error: error.message
    });
  }
};

// Add medical record
const addMedicalRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }
    
    animal.medicalRecords.push(req.body);
    await animal.save();
    
    logger.info(`Medical record added for animal: ${animal.name}`);
    
    res.json({
      success: true,
      message: 'Medical record added successfully',
      data: animal.medicalRecords[animal.medicalRecords.length - 1]
    });
  } catch (error) {
    logger.error('Error adding medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding medical record',
      error: error.message
    });
  }
};

// Add feeding record
const addFeedingRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }
    
    animal.feedingSchedule.push(req.body);
    await animal.save();
    
    logger.info(`Feeding record added for animal: ${animal.name}`);
    
    res.json({
      success: true,
      message: 'Feeding record added successfully',
      data: animal.feedingSchedule[animal.feedingSchedule.length - 1]
    });
  } catch (error) {
    logger.error('Error adding feeding record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding feeding record',
      error: error.message
    });
  }
};

// Get animal statistics
const getAnimalStats = async (req, res) => {
  try {
    const stats = await Animal.getPopulationStats();
    
    const totalAnimals = await Animal.countDocuments();
    const endangeredCount = await Animal.countDocuments({ isEndangered: true });
    const dueForHealthCheck = await Animal.countDocuments({
      nextHealthCheck: { $lte: new Date() }
    });
    
    res.json({
      success: true,
      data: {
        totalAnimals,
        endangeredCount,
        dueForHealthCheck,
        speciesBreakdown: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching animal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching animal statistics',
      error: error.message
    });
  }
};

// Search animals
const searchAnimals = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const animals = await Animal.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { species: new RegExp(query, 'i') },
        { scientificName: new RegExp(query, 'i') },
        { microchipId: new RegExp(query, 'i') },
        { rfidTag: new RegExp(query, 'i') }
      ]
    })
    .populate('exhibitId', 'name type theme')
    .limit(20);
    
    res.json({
      success: true,
      data: animals
    });
  } catch (error) {
    logger.error('Error searching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching animals',
      error: error.message
    });
  }
};

module.exports = {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  addMedicalRecord,
  addFeedingRecord,
  getAnimalStats,
  searchAnimals
};
