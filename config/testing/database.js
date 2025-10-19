const mongoose = require('mongoose');
const logger = require('../../src/utils/logger');

const testingConfig = {
  // MongoDB connection settings
  mongodb: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/zoo_management_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      retryWrites: false,
      retryReads: false
    }
  },

  // Redis connection settings
  redis: {
    url: process.env.REDIS_TEST_URL || 'redis://localhost:6379/1',
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

  // Testing-specific settings
  testing: {
    // Enable detailed logging
    verboseLogging: true,
    
    // Enable query logging
    logQueries: true,
    
    // Enable slow query logging (queries taking more than 50ms)
    logSlowQueries: true,
    slowQueryThreshold: 50,
    
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
    enableReplicaSetMonitoring: false,
    
    // Enable sharding monitoring
    enableShardingMonitoring: false,
    
    // Enable oplog monitoring
    enableOplogMonitoring: false,
    
    // Enable profiler
    enableProfiler: true,
    
    // Profiler settings
    profiler: {
      slowms: 50,
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
    enableCaching: false,
    
    // Cache settings
    cache: {
      ttl: 60, // 1 minute
      maxSize: 100,
      enabled: false
    },
    
    // Enable compression
    enableCompression: false,
    
    // Compression settings
    compression: {
      algorithm: 'gzip',
      level: 1
    },
    
    // Enable encryption
    enableEncryption: false,
    
    // Encryption settings
    encryption: {
      algorithm: 'AES-256-GCM',
      key: 'test-key-not-secure'
    },
    
    // Enable backup
    enableBackup: false,
    
    // Backup settings
    backup: {
      frequency: 'never',
      retention: 0,
      compression: false,
      encryption: false
    },
    
    // Enable replication
    enableReplication: false,
    
    // Replication settings
    replication: {
      enabled: false,
      primary: null,
      secondaries: []
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
      interval: 30000, // 30 seconds
      metrics: [
        'connections',
        'operations',
        'memory',
        'cpu',
        'disk',
        'network',
        'locks',
        'queues'
      ]
    },
    
    // Enable alerting
    enableAlerting: false,
    
    // Alerting settings
    alerting: {
      enabled: false,
      thresholds: {
        connections: 80,
        memory: 80,
        cpu: 80,
        disk: 80,
        slowQueries: 10,
        errors: 5
      },
      channels: ['console']
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
        'profiler',
        'explain',
        'hints',
        'optimization',
        'monitoring'
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
      cleanup: true,
      parallel: true,
      isolation: true,
      transactions: true,
      rollback: true
    },
    
    // Enable development tools
    enableDevelopmentTools: false,
    
    // Development tools settings
    developmentTools: {
      enabled: false,
      mongoExpress: false,
      mongoExpressPort: null,
      mongoExpressAuth: false,
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
      logger.info('MongoDB test connection established');
    },
    
    onDisconnected: () => {
      logger.warn('MongoDB test connection lost');
    },
    
    onReconnected: () => {
      logger.info('MongoDB test connection restored');
    },
    
    onError: (error) => {
      logger.error('MongoDB test connection error:', error);
    },
    
    onTimeout: () => {
      logger.error('MongoDB test connection timeout');
    },
    
    onClose: () => {
      logger.info('MongoDB test connection closed');
    }
  },

  // Query middleware
  queryMiddleware: {
    // Log all queries
    logQueries: (query) => {
      if (testingConfig.testing.logQueries) {
        logger.debug('MongoDB Test Query:', {
          collection: query.collection.name,
          operation: query.op,
          filter: query.getFilter(),
          options: query.getOptions()
        });
      }
    },
    
    // Log slow queries
    logSlowQueries: (query, time) => {
      if (testingConfig.testing.logSlowQueries && time > testingConfig.testing.slowQueryThreshold) {
        logger.warn('Slow MongoDB Test Query:', {
          collection: query.collection.name,
          operation: query.op,
          filter: query.getFilter(),
          time: `${time}ms`,
          threshold: `${testingConfig.testing.slowQueryThreshold}ms`
        });
      }
    },
    
    // Log query errors
    logQueryErrors: (error, query) => {
      if (testingConfig.testing.logErrors) {
        logger.error('MongoDB Test Query Error:', {
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
      if (testingConfig.testing.enableConnectionPoolMonitoring) {
        const stats = mongoose.connection.db.stats();
        logger.debug('Test Connection Pool Stats:', stats);
      }
    },
    
    // Monitor query performance
    monitorQueryPerformance: (query, time) => {
      if (testingConfig.testing.enableQueryPerformanceMonitoring) {
        logger.debug('Test Query Performance:', {
          collection: query.collection.name,
          operation: query.op,
          time: `${time}ms`,
          filter: query.getFilter()
        });
      }
    },
    
    // Monitor index usage
    monitorIndexUsage: (query) => {
      if (testingConfig.testing.enableIndexUsageMonitoring) {
        query.explain().then(explain => {
          logger.debug('Test Index Usage:', {
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
    interval: 15000, // 15 seconds
    timeout: 5000, // 5 seconds
    retries: 3,
    onHealthy: () => {
      logger.debug('Test database health check: healthy');
    },
    onUnhealthy: (error) => {
      logger.error('Test database health check: unhealthy', error);
    }
  },

  // Graceful shutdown
  gracefulShutdown: {
    enabled: true,
    timeout: 5000, // 5 seconds
    onShutdown: () => {
      logger.info('Test database graceful shutdown initiated');
    },
    onShutdownComplete: () => {
      logger.info('Test database graceful shutdown completed');
    },
    onShutdownError: (error) => {
      logger.error('Test database graceful shutdown error:', error);
    }
  }
};

module.exports = testingConfig;
