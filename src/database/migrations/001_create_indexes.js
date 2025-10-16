const mongoose = require('mongoose');
const logger = require('../../utils/logger');

async function up() {
  try {
    logger.info('Running migration: 001_create_indexes');
    
    const db = mongoose.connection.db;

    // User indexes
    logger.info('Creating User indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isActive: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ lastLogin: -1 });

    // Animal indexes
    logger.info('Creating Animal indexes...');
    await db.collection('animals').createIndex({ name: 1 });
    await db.collection('animals').createIndex({ species: 1 });
    await db.collection('animals').createIndex({ exhibitId: 1 });
    await db.collection('animals').createIndex({ status: 1 });
    await db.collection('animals').createIndex({ microchipId: 1 }, { unique: true, sparse: true });
    await db.collection('animals').createIndex({ rfidTag: 1 }, { unique: true, sparse: true });
    await db.collection('animals').createIndex({ birthDate: 1 });
    await db.collection('animals').createIndex({ isEndangered: 1 });
    await db.collection('animals').createIndex({ createdAt: -1 });

    // Visitor indexes
    logger.info('Creating Visitor indexes...');
    await db.collection('visitors').createIndex({ email: 1 }, { unique: true });
    await db.collection('visitors').createIndex({ phone: 1 });
    await db.collection('visitors').createIndex({ lastName: 1, firstName: 1 });
    await db.collection('visitors').createIndex({ 'membership.type': 1 });
    await db.collection('visitors').createIndex({ isVip: 1 });
    await db.collection('visitors').createIndex({ lastVisitDate: -1 });
    await db.collection('visitors').createIndex({ totalSpent: -1 });
    await db.collection('visitors').createIndex({ totalVisits: -1 });
    await db.collection('visitors').createIndex({ createdAt: -1 });

    // Exhibit indexes
    logger.info('Creating Exhibit indexes...');
    await db.collection('exhibits').createIndex({ name: 1 });
    await db.collection('exhibits').createIndex({ type: 1 });
    await db.collection('exhibits').createIndex({ theme: 1 });
    await db.collection('exhibits').createIndex({ status: 1 });
    await db.collection('exhibits').createIndex({ 'location.building': 1 });
    await db.collection('exhibits').createIndex({ isActive: 1 });
    await db.collection('exhibits').createIndex({ createdAt: -1 });

    // Staff indexes
    logger.info('Creating Staff indexes...');
    await db.collection('staff').createIndex({ employeeId: 1 }, { unique: true });
    await db.collection('staff').createIndex({ email: 1 }, { unique: true });
    await db.collection('staff').createIndex({ role: 1 });
    await db.collection('staff').createIndex({ department: 1 });
    await db.collection('staff').createIndex({ isActive: 1 });
    await db.collection('staff').createIndex({ hireDate: 1 });
    await db.collection('staff').createIndex({ createdAt: -1 });

    // Feeding indexes
    logger.info('Creating Feeding indexes...');
    await db.collection('feedings').createIndex({ animalId: 1 });
    await db.collection('feedings').createIndex({ exhibitId: 1 });
    await db.collection('feedings').createIndex({ completed: 1 });
    await db.collection('feedings').createIndex({ scheduledTime: 1 });
    await db.collection('feedings').createIndex({ createdAt: -1 });

    // Health Record indexes
    logger.info('Creating Health Record indexes...');
    await db.collection('healthrecords').createIndex({ animalId: 1 });
    await db.collection('healthrecords').createIndex({ date: -1 });
    await db.collection('healthrecords').createIndex({ veterinarian: 1 });
    await db.collection('healthrecords').createIndex({ type: 1 });
    await db.collection('healthrecords').createIndex({ status: 1 });
    await db.collection('healthrecords').createIndex({ followUpDate: 1 });
    await db.collection('healthrecords').createIndex({ createdAt: -1 });

    // Ticket indexes
    logger.info('Creating Ticket indexes...');
    await db.collection('tickets').createIndex({ ticketId: 1 }, { unique: true });
    await db.collection('tickets').createIndex({ visitorId: 1 });
    await db.collection('tickets').createIndex({ type: 1 });
    await db.collection('tickets').createIndex({ purchaseDate: -1 });
    await db.collection('tickets').createIndex({ visitDate: 1 });
    await db.collection('tickets').createIndex({ isUsed: 1 });
    await db.collection('tickets').createIndex({ transactionId: 1 });
    await db.collection('tickets').createIndex({ createdAt: -1 });

    // Report indexes
    logger.info('Creating Report indexes...');
    await db.collection('reports').createIndex({ type: 1 });
    await db.collection('reports').createIndex({ period: 1 });
    await db.collection('reports').createIndex({ generatedBy: 1 });
    await db.collection('reports').createIndex({ startDate: -1 });
    await db.collection('reports').createIndex({ status: 1 });
    await db.collection('reports').createIndex({ createdAt: -1 });

    logger.info('Migration 001_create_indexes completed successfully');
  } catch (error) {
    logger.error('Migration 001_create_indexes failed:', error);
    throw error;
  }
}

async function down() {
  try {
    logger.info('Rolling back migration: 001_create_indexes');
    
    const db = mongoose.connection.db;

    // Drop all indexes except _id
    const collections = ['users', 'animals', 'visitors', 'exhibits', 'staff', 'feedings', 'healthrecords', 'tickets', 'reports'];
    
    for (const collectionName of collections) {
      try {
        logger.info(`Dropping indexes for ${collectionName}...`);
        await db.collection(collectionName).dropIndexes();
      } catch (error) {
        logger.warn(`No indexes to drop for ${collectionName}`);
      }
    }

    logger.info('Migration 001_create_indexes rollback completed');
  } catch (error) {
    logger.error('Migration 001_create_indexes rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };
