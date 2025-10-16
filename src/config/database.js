const mongoose = require('mongoose');
const logger = require('../utils/logger');

class DatabaseConfig {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        logger.info('Database is already connected');
        return this.connection;
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: process.env.NODE_ENV === 'production' ? 50 : 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        retryReads: true
      };

      this.connection = await mongoose.connect(mongoUri, options);
      this.isConnected = true;

      logger.info('MongoDB connected successfully');
      logger.info(`Database: ${mongoose.connection.name}`);
      logger.info(`Host: ${mongoose.connection.host}`);
      logger.info(`Port: ${mongoose.connection.port}`);

      // Set up event listeners
      this.setupEventListeners();

      return this.connection;
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      throw error;
    }
  }

  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    mongoose.connection.on('error', (error) => {
      logger.error('Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect() {
    try {
      if (!this.isConnected) {
        logger.info('Database is not connected');
        return;
      }

      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          message: 'Database is not connected'
        };
      }

      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        message: 'Database is connected and responsive',
        details: {
          database: mongoose.connection.name,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          readyState: mongoose.connection.readyState
        }
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        message: 'Database health check failed',
        error: error.message
      };
    }
  }

  getConnectionState() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      state: states[mongoose.connection.readyState] || 'unknown',
      readyState: mongoose.connection.readyState,
      isConnected: this.isConnected
    };
  }

  async dropDatabase() {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot drop database in production environment');
      }

      await mongoose.connection.dropDatabase();
      logger.info('Database dropped successfully');
    } catch (error) {
      logger.error('Error dropping database:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        database: mongoose.connection.name,
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      throw error;
    }
  }

  async listCollections() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      return collections.map(collection => collection.name);
    } catch (error) {
      logger.error('Error listing collections:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseConfig();
