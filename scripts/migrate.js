const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models to ensure they are registered
require('../src/models/User');
require('../src/models/Animal');
require('../src/models/Visitor');
require('../src/models/Exhibit');
require('../src/models/Staff');
require('../src/models/Feeding');
require('../src/models/HealthRecord');
require('../src/models/Ticket');
require('../src/models/Report');

const logger = require('../src/utils/logger');

class DatabaseMigrator {
  constructor() {
    this.connection = null;
    this.migrations = [];
    this.setupMigrations();
  }

  setupMigrations() {
    // Define migration functions
    this.migrations = [
      {
        version: '1.0.0',
        name: 'Initial Schema Setup',
        up: this.createInitialIndexes.bind(this),
        down: this.dropInitialIndexes.bind(this)
      },
      {
        version: '1.1.0',
        name: 'Add Visitor Analytics',
        up: this.addVisitorAnalytics.bind(this),
        down: this.removeVisitorAnalytics.bind(this)
      },
      {
        version: '1.2.0',
        name: 'Add Animal Health Tracking',
        up: this.addAnimalHealthTracking.bind(this),
        down: this.removeAnimalHealthTracking.bind(this)
      },
      {
        version: '1.3.0',
        name: 'Add Exhibit Monitoring',
        up: this.addExhibitMonitoring.bind(this),
        down: this.removeExhibitMonitoring.bind(this)
      },
      {
        version: '1.4.0',
        name: 'Add Staff Scheduling',
        up: this.addStaffScheduling.bind(this),
        down: this.removeStaffScheduling.bind(this)
      }
    ];
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management';
      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('Connected to MongoDB for migration');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      logger.info('Disconnected from MongoDB');
    }
  }

  async getCurrentVersion() {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('migrations');
      const latest = await collection.findOne({}, { sort: { version: -1 } });
      return latest ? latest.version : '0.0.0';
    } catch (error) {
      logger.warn('Could not get current migration version:', error);
      return '0.0.0';
    }
  }

  async setVersion(version) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('migrations');
      await collection.insertOne({
        version,
        timestamp: new Date(),
        applied: true
      });
      logger.info(`Migration version ${version} recorded`);
    } catch (error) {
      logger.error('Failed to record migration version:', error);
      throw error;
    }
  }

  async migrate(targetVersion = null) {
    try {
      await this.connect();
      
      const currentVersion = await this.getCurrentVersion();
      logger.info(`Current migration version: ${currentVersion}`);
      
      const target = targetVersion || this.migrations[this.migrations.length - 1].version;
      logger.info(`Target migration version: ${target}`);
      
      const migrationsToRun = this.migrations.filter(migration => {
        return this.compareVersions(migration.version, currentVersion) > 0 &&
               this.compareVersions(migration.version, target) <= 0;
      });
      
      if (migrationsToRun.length === 0) {
        logger.info('No migrations to run');
        return;
      }
      
      logger.info(`Running ${migrationsToRun.length} migrations...`);
      
      for (const migration of migrationsToRun) {
        logger.info(`Running migration ${migration.version}: ${migration.name}`);
        await migration.up();
        await this.setVersion(migration.version);
        logger.info(`Migration ${migration.version} completed successfully`);
      }
      
      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async rollback(targetVersion) {
    try {
      await this.connect();
      
      const currentVersion = await this.getCurrentVersion();
      logger.info(`Current migration version: ${currentVersion}`);
      logger.info(`Rolling back to version: ${targetVersion}`);
      
      const migrationsToRollback = this.migrations.filter(migration => {
        return this.compareVersions(migration.version, targetVersion) > 0 &&
               this.compareVersions(migration.version, currentVersion) <= 0;
      }).reverse();
      
      if (migrationsToRollback.length === 0) {
        logger.info('No migrations to rollback');
        return;
      }
      
      logger.info(`Rolling back ${migrationsToRollback.length} migrations...`);
      
      for (const migration of migrationsToRollback) {
        logger.info(`Rolling back migration ${migration.version}: ${migration.name}`);
        await migration.down();
        await this.removeVersion(migration.version);
        logger.info(`Migration ${migration.version} rolled back successfully`);
      }
      
      logger.info('All rollbacks completed successfully');
    } catch (error) {
      logger.error('Rollback failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async removeVersion(version) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('migrations');
      await collection.deleteOne({ version });
      logger.info(`Migration version ${version} removed`);
    } catch (error) {
      logger.error('Failed to remove migration version:', error);
      throw error;
    }
  }

  compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    
    return 0;
  }

  // Migration implementations
  async createInitialIndexes() {
    logger.info('Creating initial indexes...');
    
    const db = mongoose.connection.db;
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isActive: 1 });
    
    // Animal indexes
    await db.collection('animals').createIndex({ name: 1 });
    await db.collection('animals').createIndex({ species: 1 });
    await db.collection('animals').createIndex({ exhibitId: 1 });
    await db.collection('animals').createIndex({ status: 1 });
    await db.collection('animals').createIndex({ microchipId: 1 }, { unique: true, sparse: true });
    
    // Visitor indexes
    await db.collection('visitors').createIndex({ email: 1 }, { unique: true });
    await db.collection('visitors').createIndex({ phone: 1 });
    await db.collection('visitors').createIndex({ isVip: 1 });
    await db.collection('visitors').createIndex({ lastVisitDate: -1 });
    
    // Exhibit indexes
    await db.collection('exhibits').createIndex({ name: 1 });
    await db.collection('exhibits').createIndex({ type: 1 });
    await db.collection('exhibits').createIndex({ status: 1 });
    
    logger.info('Initial indexes created successfully');
  }

  async dropInitialIndexes() {
    logger.info('Dropping initial indexes...');
    
    const db = mongoose.connection.db;
    
    try {
      await db.collection('users').dropIndexes();
      await db.collection('animals').dropIndexes();
      await db.collection('visitors').dropIndexes();
      await db.collection('exhibits').dropIndexes();
      logger.info('Initial indexes dropped successfully');
    } catch (error) {
      logger.warn('Some indexes may not exist:', error);
    }
  }

  async addVisitorAnalytics() {
    logger.info('Adding visitor analytics...');
    
    const db = mongoose.connection.db;
    
    // Add analytics indexes
    await db.collection('visitors').createIndex({ totalSpent: -1 });
    await db.collection('visitors').createIndex({ totalVisits: -1 });
    await db.collection('visitors').createIndex({ 'membership.type': 1 });
    
    // Add analytics collection
    await db.createCollection('visitor_analytics');
    await db.collection('visitor_analytics').createIndex({ date: 1 });
    await db.collection('visitor_analytics').createIndex({ visitorId: 1 });
    
    logger.info('Visitor analytics added successfully');
  }

  async removeVisitorAnalytics() {
    logger.info('Removing visitor analytics...');
    
    const db = mongoose.connection.db;
    
    try {
      await db.collection('visitor_analytics').drop();
      await db.collection('visitors').dropIndex({ totalSpent: -1 });
      await db.collection('visitors').dropIndex({ totalVisits: -1 });
      await db.collection('visitors').dropIndex({ 'membership.type': 1 });
      logger.info('Visitor analytics removed successfully');
    } catch (error) {
      logger.warn('Some analytics indexes may not exist:', error);
    }
  }

  async addAnimalHealthTracking() {
    logger.info('Adding animal health tracking...');
    
    const db = mongoose.connection.db;
    
    // Add health tracking indexes
    await db.collection('animals').createIndex({ lastHealthCheck: 1 });
    await db.collection('animals').createIndex({ nextHealthCheck: 1 });
    await db.collection('animals').createIndex({ isEndangered: 1 });
    
    // Add health records collection
    await db.createCollection('health_records');
    await db.collection('health_records').createIndex({ animalId: 1 });
    await db.collection('health_records').createIndex({ date: -1 });
    await db.collection('health_records').createIndex({ veterinarian: 1 });
    
    logger.info('Animal health tracking added successfully');
  }

  async removeAnimalHealthTracking() {
    logger.info('Removing animal health tracking...');
    
    const db = mongoose.connection.db;
    
    try {
      await db.collection('health_records').drop();
      await db.collection('animals').dropIndex({ lastHealthCheck: 1 });
      await db.collection('animals').dropIndex({ nextHealthCheck: 1 });
      await db.collection('animals').dropIndex({ isEndangered: 1 });
      logger.info('Animal health tracking removed successfully');
    } catch (error) {
      logger.warn('Some health tracking indexes may not exist:', error);
    }
  }

  async addExhibitMonitoring() {
    logger.info('Adding exhibit monitoring...');
    
    const db = mongoose.connection.db;
    
    // Add monitoring indexes
    await db.collection('exhibits').createIndex({ 'environmentalControls.temperature.current': 1 });
    await db.collection('exhibits').createIndex({ 'environmentalControls.humidity.current': 1 });
    await db.collection('exhibits').createIndex({ lastInspection: 1 });
    await db.collection('exhibits').createIndex({ nextInspection: 1 });
    
    // Add monitoring data collection
    await db.createCollection('exhibit_monitoring');
    await db.collection('exhibit_monitoring').createIndex({ exhibitId: 1 });
    await db.collection('exhibit_monitoring').createIndex({ timestamp: -1 });
    await db.collection('exhibit_monitoring').createIndex({ type: 1 });
    
    logger.info('Exhibit monitoring added successfully');
  }

  async removeExhibitMonitoring() {
    logger.info('Removing exhibit monitoring...');
    
    const db = mongoose.connection.db;
    
    try {
      await db.collection('exhibit_monitoring').drop();
      await db.collection('exhibits').dropIndex({ 'environmentalControls.temperature.current': 1 });
      await db.collection('exhibits').dropIndex({ 'environmentalControls.humidity.current': 1 });
      await db.collection('exhibits').dropIndex({ lastInspection: 1 });
      await db.collection('exhibits').dropIndex({ nextInspection: 1 });
      logger.info('Exhibit monitoring removed successfully');
    } catch (error) {
      logger.warn('Some monitoring indexes may not exist:', error);
    }
  }

  async addStaffScheduling() {
    logger.info('Adding staff scheduling...');
    
    const db = mongoose.connection.db;
    
    // Add staff indexes
    await db.collection('staff').createIndex({ employeeId: 1 }, { unique: true });
    await db.collection('staff').createIndex({ department: 1 });
    await db.collection('staff').createIndex({ position: 1 });
    await db.collection('staff').createIndex({ isActive: 1 });
    
    // Add schedules collection
    await db.createCollection('staff_schedules');
    await db.collection('staff_schedules').createIndex({ staffId: 1 });
    await db.collection('staff_schedules').createIndex({ date: 1 });
    await db.collection('staff_schedules').createIndex({ shift: 1 });
    
    logger.info('Staff scheduling added successfully');
  }

  async removeStaffScheduling() {
    logger.info('Removing staff scheduling...');
    
    const db = mongoose.connection.db;
    
    try {
      await db.collection('staff_schedules').drop();
      await db.collection('staff').dropIndex({ employeeId: 1 });
      await db.collection('staff').dropIndex({ department: 1 });
      await db.collection('staff').dropIndex({ position: 1 });
      await db.collection('staff').dropIndex({ isActive: 1 });
      logger.info('Staff scheduling removed successfully');
    } catch (error) {
      logger.warn('Some staff indexes may not exist:', error);
    }
  }

  async status() {
    try {
      await this.connect();
      
      const currentVersion = await this.getCurrentVersion();
      const db = mongoose.connection.db;
      
      // Get migration history
      const migrations = await db.collection('migrations').find({}).sort({ version: 1 }).toArray();
      
      logger.info('Migration Status:');
      logger.info(`Current Version: ${currentVersion}`);
      logger.info(`Available Migrations: ${this.migrations.length}`);
      logger.info('\nMigration History:');
      
      migrations.forEach(migration => {
        logger.info(`  ${migration.version} - ${migration.timestamp} - ${migration.applied ? 'Applied' : 'Pending'}`);
      });
      
      logger.info('\nPending Migrations:');
      const pendingMigrations = this.migrations.filter(migration => 
        this.compareVersions(migration.version, currentVersion) > 0
      );
      
      if (pendingMigrations.length === 0) {
        logger.info('  No pending migrations');
      } else {
        pendingMigrations.forEach(migration => {
          logger.info(`  ${migration.version} - ${migration.name}`);
        });
      }
    } catch (error) {
      logger.error('Failed to get migration status:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
async function main() {
  const migrator = new DatabaseMigrator();
  const command = process.argv[2];
  const targetVersion = process.argv[3];
  
  try {
    switch (command) {
      case 'migrate':
        await migrator.migrate(targetVersion);
        break;
      case 'rollback':
        if (!targetVersion) {
          throw new Error('Target version required for rollback');
        }
        await migrator.rollback(targetVersion);
        break;
      case 'status':
        await migrator.status();
        break;
      default:
        console.log('Usage: node migrate.js [migrate|rollback|status] [targetVersion]');
        console.log('  migrate [version]  - Run migrations up to target version');
        console.log('  rollback [version] - Rollback to target version');
        console.log('  status            - Show migration status');
        process.exit(1);
    }
  } catch (error) {
    logger.error('Migration command failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseMigrator;
