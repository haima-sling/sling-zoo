const mongoose = require('mongoose');
const logger = require('../../src/utils/logger');

const developmentConfig = {
  // MongoDB connection settings
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management_dev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    }
  },

  // Redis connection settings
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    }
  },

  // Database connection management
  connection: {
    autoConnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    gracefulShutdownTimeout: 10000
  },

  // Development-specific settings
  development: {
    // Enable detailed logging
    verboseLogging: true,
    
    // Enable query logging
    logQueries: true,
    
    // Enable slow query logging (queries taking more than 100ms)
    logSlowQueries: true,
    slowQueryThreshold: 100,
    
    // Enable connection event logging
    logConnectionEvents: true,
    
    // Enable index creation logging
    logIndexCreation: true,
    
    // Enable validation logging
    logValidationErrors: true,
    
    // Enable population logging
    logPopulation: true,
    
    // Enable middleware logging
    logMiddleware: true,
    
    // Enable aggregation logging
    logAggregation: true,
    
    // Enable transaction logging
    logTransactions: true,
    
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
      slowms: 100,
      sampleRate: 1.0
    },
    
    // Enable explain plans
    enableExplainPlans: true,
    
    // Enable query hints
    enableQueryHints: true,
    
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
      ttl: 300, // 5 minutes
      maxSize: 1000,
      enabled: true
    },
    
    // Enable compression
    enableCompression: true,
    
    // Compression settings
    compression: {
      algorithm: 'gzip',
      level: 6
    },
    
    // Enable encryption
    enableEncryption: false, // Disabled in development
    
    // Encryption settings
    encryption: {
      algorithm: 'AES-256-GCM',
      key: process.env.ENCRYPTION_KEY || 'development-key-not-secure'
    },
    
    // Enable backup
    enableBackup: false, // Disabled in development
    
    // Backup settings
    backup: {
      frequency: 'daily',
      retention: 7,
      compression: true,
      encryption: false
    },
    
    // Enable replication
    enableReplication: false, // Disabled in development
    
    // Replication settings
    replication: {
      enabled: false,
      primary: 'mongodb://localhost:27017/zoo_management_dev',
      secondaries: []
    },
    
    // Enable sharding
    enableSharding: false, // Disabled in development
    
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
      interval: 60000, // 1 minute
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
        connections: 80,
        memory: 80,
        cpu: 80,
        disk: 80,
        slowQueries: 10,
        errors: 5
      },
      channels: ['console', 'log']
    },
    
    // Enable debugging
    enableDebugging: true,
    
    // Debug settings
    debug: {
      enabled: true,
      level: 'debug',
      categories: [
        'connection',
        'query',
        'index',
        'validation',
        'population',
        'middleware',
        'aggregation',
        'transaction',
        'error',
        'performance',
        'memory',
        'connectionPool',
        'queryPerformance',
        'indexUsage',
        'collectionStats',
        'databaseStats',
        'replicaSet',
        'sharding',
        'oplog',
        'profiler',
        'explain',
        'hints',
        'optimization',
        'caching',
        'compression',
        'encryption',
        'backup',
        'replication',
        'sharding',
        'monitoring',
        'alerting'
      ]
    },
    
    // Enable testing
    enableTesting: true,
    
    // Testing settings
    testing: {
      enabled: true,
      fixtures: true,
      seedData: true,
      mockData: true,
      testDatabase: 'zoo_management_test',
      cleanup: true
    },
    
    // Enable development tools
    enableDevelopmentTools: true,
    
    // Development tools settings
    developmentTools: {
      enabled: true,
      mongoExpress: true,
      mongoExpressPort: 8081,
      mongoExpressAuth: false,
      mongoExpressUsername: 'admin',
      mongoExpressPassword: 'admin',
      compass: true,
      studio3t: true,
      robo3t: true
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
    // Log all queries
    logQueries: (query) => {
      if (developmentConfig.development.logQueries) {
        logger.debug('MongoDB Query:', {
          collection: query.collection.name,
          operation: query.op,
          filter: query.getFilter(),
          options: query.getOptions()
        });
      }
    },
    
    // Log slow queries
    logSlowQueries: (query, time) => {
      if (developmentConfig.development.logSlowQueries && time > developmentConfig.development.slowQueryThreshold) {
        logger.warn('Slow MongoDB Query:', {
          collection: query.collection.name,
          operation: query.op,
          filter: query.getFilter(),
          time: `${time}ms`,
          threshold: `${developmentConfig.development.slowQueryThreshold}ms`
        });
      }
    },
    
    // Log query errors
    logQueryErrors: (error, query) => {
      if (developmentConfig.development.logErrors) {
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
      if (developmentConfig.development.enableConnectionPoolMonitoring) {
        const stats = mongoose.connection.db.stats();
        logger.debug('Connection Pool Stats:', stats);
      }
    },
    
    // Monitor query performance
    monitorQueryPerformance: (query, time) => {
      if (developmentConfig.development.enableQueryPerformanceMonitoring) {
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
      if (developmentConfig.development.enableIndexUsageMonitoring) {
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
    interval: 30000, // 30 seconds
    timeout: 5000, // 5 seconds
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
    timeout: 10000, // 10 seconds
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

module.exports = developmentConfig;
