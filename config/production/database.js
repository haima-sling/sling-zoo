const mongoose = require('mongoose');
const logger = require('../../src/utils/logger');

const productionConfig = {
  // MongoDB connection settings
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      retryWrites: true,
      retryReads: true,
      readPreference: 'secondaryPreferred',
      writeConcern: { w: 'majority', j: true }
    }
  },

  // Redis connection settings
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      connectTimeout: 10000,
      commandTimeout: 5000
    }
  },

  // Production-specific settings
  production: {
    // Disable detailed logging
    verboseLogging: false,
    
    // Disable query logging
    logQueries: false,
    
    // Enable slow query logging (queries taking more than 1000ms)
    logSlowQueries: true,
    slowQueryThreshold: 1000,
    
    // Disable connection event logging
    logConnectionEvents: false,
    
    // Disable index creation logging
    logIndexCreation: false,
    
    // Disable validation logging
    logValidationErrors: false,
    
    // Disable population logging
    logPopulation: false,
    
    // Disable middleware logging
    logMiddleware: false,
    
    // Disable aggregation logging
    logAggregation: false,
    
    // Disable transaction logging
    logTransactions: false,
    
    // Enable error logging
    logErrors: true,
    
    // Enable performance monitoring
    enablePerformanceMonitoring: true,
    
    // Enable memory usage monitoring
    enableMemoryMonitoring: true,
    
    // Enable connection pool monitoring
    enableConnectionPoolMonitoring: true,
    
    // Enable query performance monitoring
    enableQueryPerformanceMonitoring: true,
    
    // Enable index usage monitoring
    enableIndexUsageMonitoring: true,
    
    // Enable collection statistics monitoring
    enableCollectionStatsMonitoring: true,
    
    // Enable database statistics monitoring
    enableDatabaseStatsMonitoring: true,
    
    // Enable replica set monitoring
    enableReplicaSetMonitoring: true,
    
    // Enable sharding monitoring
    enableShardingMonitoring: true,
    
    // Enable oplog monitoring
    enableOplogMonitoring: true,
    
    // Enable profiler
    enableProfiler: true,
    
    // Profiler settings
    profiler: {
      slowms: 1000,
      sampleRate: 0.1
    },
    
    // Enable explain plans
    enableExplainPlans: false,
    
    // Enable query hints
    enableQueryHints: false,
    
    // Enable query optimization
    enableQueryOptimization: true,
    
    // Enable index optimization
    enableIndexOptimization: true,
    
    // Enable collection optimization
    enableCollectionOptimization: true,
    
    // Enable database optimization
    enableDatabaseOptimization: true,
    
    // Enable performance tuning
    enablePerformanceTuning: true,
    
    // Enable caching
    enableCaching: true,
    
    // Cache settings
    cache: {
      ttl: 3600, // 1 hour
      maxSize: 10000,
      enabled: true
    },
    
    // Enable compression
    enableCompression: true,
    
    // Compression settings
    compression: {
      algorithm: 'gzip',
      level: 9
    },
    
    // Enable encryption
    enableEncryption: true,
    
    // Encryption settings
    encryption: {
      algorithm: 'AES-256-GCM',
      key: process.env.ENCRYPTION_KEY
    },
    
    // Enable backup
    enableBackup: true,
    
    // Backup settings
    backup: {
      frequency: 'daily',
      retention: 30,
      compression: true,
      encryption: true
    },
    
    // Enable replication
    enableReplication: true,
    
    // Replication settings
    replication: {
      enabled: true,
      primary: process.env.MONGODB_PRIMARY_URI,
      secondaries: process.env.MONGODB_SECONDARY_URIS?.split(',') || []
    },
    
    // Enable sharding
    enableSharding: false,
    
    // Sharding settings
    sharding: {
      enabled: false,
      shardKey: '_id',
      shards: []
    },
    
    // Enable monitoring
    enableMonitoring: true,
    
    // Monitoring settings
    monitoring: {
      enabled: true,
      interval: 300000, // 5 minutes
      metrics: [
        'connections',
        'operations',
        'memory',
        'cpu',
        'disk',
        'network',
        'locks',
        'queues',
        'replication',
        'sharding'
      ]
    },
    
    // Enable alerting
    enableAlerting: true,
    
    // Alerting settings
    alerting: {
      enabled: true,
      thresholds: {
        connections: 90,
        memory: 85,
        cpu: 85,
        disk: 90,
        slowQueries: 5,
        errors: 1
      },
      channels: ['email', 'slack', 'webhook']
    },
    
    // Enable debugging
    enableDebugging: false,
    
    // Debug settings
    debug: {
      enabled: false,
      level: 'error',
      categories: ['error']
    },
    
    // Enable testing
    enableTesting: false,
    
    // Testing settings
    testing: {
      enabled: false,
      fixtures: false,
      seedData: false,
      mockData: false,
      testDatabase: null,
      cleanup: false
    },
    
    // Enable development tools
    enableDevelopmentTools: false,
    
    // Development tools settings
    developmentTools: {
      enabled: false,
      mongoExpress: false,
      mongoExpressPort: null,
      mongoExpressAuth: true,
      mongoExpressUsername: null,
      mongoExpressPassword: null,
      compass: false,
      studio3t: false,
      robo3t: false
    }
  },

  // Connection event handlers
  eventHandlers: {
    onConnected: () => {
      logger.info('MongoDB connected successfully');
    },
    
    onDisconnected: () => {
      logger.warn('MongoDB disconnected');
    },
    
    onReconnected: () => {
      logger.info('MongoDB reconnected');
    },
    
    onError: (error) => {
      logger.error('MongoDB connection error:', error);
    },
    
    onTimeout: () => {
      logger.error('MongoDB connection timeout');
    },
    
    onClose: () => {
      logger.info('MongoDB connection closed');
    }
  },

  // Query middleware
  queryMiddleware: {
    // Log slow queries only
    logSlowQueries: (query, time) => {
      if (productionConfig.production.logSlowQueries && time > productionConfig.production.slowQueryThreshold) {
        logger.warn('Slow MongoDB Query:', {
          collection: query.collection.name,
          operation: query.op,
          filter: query.getFilter(),
          time: `${time}ms`,
          threshold: `${productionConfig.production.slowQueryThreshold}ms`
        });
      }
    },
    
    // Log query errors
    logQueryErrors: (error, query) => {
      if (productionConfig.production.logErrors) {
        logger.error('MongoDB Query Error:', {
          error: error.message,
          collection: query.collection.name,
          operation: query.op,
          filter: query.getFilter()
        });
      }
    }
  },

  // Performance monitoring
  performanceMonitoring: {
    // Monitor connection pool
    monitorConnectionPool: () => {
      if (productionConfig.production.enableConnectionPoolMonitoring) {
        const stats = mongoose.connection.db.stats();
        logger.debug('Connection Pool Stats:', stats);
      }
    },
    
    // Monitor query performance
    monitorQueryPerformance: (query, time) => {
      if (productionConfig.production.enableQueryPerformanceMonitoring) {
        logger.debug('Query Performance:', {
          collection: query.collection.name,
          operation: query.op,
          time: `${time}ms`,
          filter: query.getFilter()
        });
      }
    },
    
    // Monitor index usage
    monitorIndexUsage: (query) => {
      if (productionConfig.production.enableIndexUsageMonitoring) {
        query.explain().then(explain => {
          logger.debug('Index Usage:', {
            collection: query.collection.name,
            operation: query.op,
            indexUsed: explain.executionStats?.executionStages?.indexName || 'none',
            executionTime: explain.executionStats?.executionTimeMillis
          });
        });
      }
    }
  },

  // Health check
  healthCheck: {
    enabled: true,
    interval: 60000, // 1 minute
    timeout: 10000, // 10 seconds
    retries: 3,
    onHealthy: () => {
      logger.debug('Database health check: healthy');
    },
    onUnhealthy: (error) => {
      logger.error('Database health check: unhealthy', error);
    }
  },

  // Graceful shutdown
  gracefulShutdown: {
    enabled: true,
    timeout: 30000, // 30 seconds
    onShutdown: () => {
      logger.info('Database graceful shutdown initiated');
    },
    onShutdownComplete: () => {
      logger.info('Database graceful shutdown completed');
    },
    onShutdownError: (error) => {
      logger.error('Database graceful shutdown error:', error);
    }
  }
};

module.exports = productionConfig;
