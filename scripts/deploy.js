const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const logger = require('../src/utils/logger');

const execAsync = util.promisify(exec);

class Deployer {
  constructor() {
    this.environment = process.env.NODE_ENV || 'production';
    this.deploymentPath = process.env.DEPLOYMENT_PATH || '/var/www/zoo-management';
    this.backupPath = process.env.BACKUP_PATH || '/var/backups/zoo-management';
  }

  async deploy() {
    try {
      logger.info('Starting deployment process...');
      logger.info(`Environment: ${this.environment}`);
      logger.info(`Deployment Path: ${this.deploymentPath}`);

      // Run pre-deployment checks
      await this.preDeploymentChecks();

      // Create backup
      await this.createBackup();

      // Build the application
      await this.buildApplication();

      // Run tests
      await this.runTests();

      // Stop the application
      await this.stopApplication();

      // Deploy new version
      await this.deployNewVersion();

      // Run database migrations
      await this.runMigrations();

      // Start the application
      await this.startApplication();

      // Run post-deployment checks
      await this.postDeploymentChecks();

      // Clean up old backups
      await this.cleanupOldBackups();

      logger.info('Deployment completed successfully!');
      process.exit(0);

    } catch (error) {
      logger.error('Deployment failed:', error);
      
      // Attempt rollback
      try {
        await this.rollback();
      } catch (rollbackError) {
        logger.error('Rollback failed:', rollbackError);
      }
      
      process.exit(1);
    }
  }

  async preDeploymentChecks() {
    logger.info('Running pre-deployment checks...');

    // Check if Node.js is installed
    try {
      const { stdout } = await execAsync('node --version');
      logger.info(`Node.js version: ${stdout.trim()}`);
    } catch (error) {
      throw new Error('Node.js is not installed');
    }

    // Check if MongoDB is accessible
    try {
      const { stdout } = await execAsync('mongosh --version');
      logger.info(`MongoDB Shell version: ${stdout.trim()}`);
    } catch (error) {
      logger.warn('MongoDB Shell not found, skipping version check');
    }

    // Check if deployment path exists
    if (!fs.existsSync(this.deploymentPath)) {
      logger.info(`Creating deployment path: ${this.deploymentPath}`);
      fs.mkdirSync(this.deploymentPath, { recursive: true });
    }

    // Check environment variables
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    logger.info('Pre-deployment checks passed');
  }

  async createBackup() {
    logger.info('Creating backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.backupPath, `backup-${timestamp}`);

    // Create backup directory
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }

    // Backup application files
    if (fs.existsSync(this.deploymentPath)) {
      logger.info(`Backing up application files to ${backupDir}`);
      await execAsync(`cp -r ${this.deploymentPath} ${backupDir}`);
    }

    // Backup database
    if (process.env.MONGODB_URI) {
      logger.info('Backing up database...');
      const dbBackupPath = path.join(backupDir, 'database');
      await execAsync(`mongodump --uri="${process.env.MONGODB_URI}" --out="${dbBackupPath}"`);
    }

    this.lastBackupPath = backupDir;
    logger.info(`Backup created: ${backupDir}`);
  }

  async buildApplication() {
    logger.info('Building application...');

    // Install dependencies
    logger.info('Installing dependencies...');
    await execAsync('npm ci --production');

    // Run build scripts if applicable
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts && packageJson.scripts.build) {
        logger.info('Running build script...');
        await execAsync('npm run build');
      }
    }

    logger.info('Build completed');
  }

  async runTests() {
    if (this.environment === 'production') {
      logger.info('Running tests...');
      
      try {
        await execAsync('npm test');
        logger.info('All tests passed');
      } catch (error) {
        throw new Error('Tests failed - deployment aborted');
      }
    } else {
      logger.info('Skipping tests in non-production environment');
    }
  }

  async stopApplication() {
    logger.info('Stopping application...');

    try {
      // Try PM2 first
      await execAsync('pm2 stop zoo-management');
      logger.info('Application stopped via PM2');
    } catch (error) {
      logger.warn('PM2 not found or app not running');
      
      // Try systemd
      try {
        await execAsync('sudo systemctl stop zoo-management');
        logger.info('Application stopped via systemd');
      } catch (systemdError) {
        logger.warn('Could not stop application via systemd');
      }
    }
  }

  async deployNewVersion() {
    logger.info('Deploying new version...');

    // Copy files to deployment path
    const filesToCopy = [
      'package.json',
      'package-lock.json',
      'src/',
      'scripts/',
      'config/',
      'public/',
      'node_modules/'
    ];

    for (const file of filesToCopy) {
      if (fs.existsSync(file)) {
        const targetPath = path.join(this.deploymentPath, file);
        logger.info(`Copying ${file}...`);
        await execAsync(`cp -r ${file} ${targetPath}`);
      }
    }

    // Copy environment file
    if (fs.existsSync('.env.production')) {
      await execAsync(`cp .env.production ${path.join(this.deploymentPath, '.env')}`);
    }

    logger.info('New version deployed');
  }

  async runMigrations() {
    logger.info('Running database migrations...');

    try {
      await execAsync(`cd ${this.deploymentPath} && node scripts/migrate.js migrate`);
      logger.info('Migrations completed');
    } catch (error) {
      logger.warn('No migrations to run or migration failed:', error.message);
    }
  }

  async startApplication() {
    logger.info('Starting application...');

    try {
      // Try PM2 first
      await execAsync(`cd ${this.deploymentPath} && pm2 start src/app.js --name zoo-management`);
      logger.info('Application started via PM2');
    } catch (error) {
      logger.warn('PM2 not available, trying systemd');
      
      // Try systemd
      try {
        await execAsync('sudo systemctl start zoo-management');
        logger.info('Application started via systemd');
      } catch (systemdError) {
        throw new Error('Failed to start application');
      }
    }

    // Wait for application to be ready
    await this.waitForApplication();
  }

  async waitForApplication(maxAttempts = 30, interval = 2000) {
    logger.info('Waiting for application to be ready...');

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
          logger.info('Application is ready');
          return;
        }
      } catch (error) {
        // Application not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Application failed to start');
  }

  async postDeploymentChecks() {
    logger.info('Running post-deployment checks...');

    // Check application health
    try {
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      logger.info('Health check:', data);
    } catch (error) {
      throw new Error('Health check failed');
    }

    // Check database connection
    try {
      const response = await fetch('http://localhost:3000/api/animals/stats');
      if (!response.ok) {
        throw new Error('API check failed');
      }
      logger.info('API endpoints responding correctly');
    } catch (error) {
      throw new Error('API check failed');
    }

    logger.info('Post-deployment checks passed');
  }

  async cleanupOldBackups() {
    logger.info('Cleaning up old backups...');

    try {
      const backups = fs.readdirSync(this.backupPath);
      const backupDirs = backups
        .filter(name => name.startsWith('backup-'))
        .sort()
        .reverse();

      // Keep only the last 5 backups
      const backupsToDelete = backupDirs.slice(5);

      for (const backup of backupsToDelete) {
        const backupPath = path.join(this.backupPath, backup);
        logger.info(`Deleting old backup: ${backupPath}`);
        await execAsync(`rm -rf ${backupPath}`);
      }

      logger.info('Backup cleanup completed');
    } catch (error) {
      logger.warn('Backup cleanup failed:', error.message);
    }
  }

  async rollback() {
    logger.info('Starting rollback...');

    if (!this.lastBackupPath) {
      throw new Error('No backup available for rollback');
    }

    // Stop the application
    await this.stopApplication();

    // Restore from backup
    logger.info(`Restoring from backup: ${this.lastBackupPath}`);
    await execAsync(`cp -r ${this.lastBackupPath}/* ${this.deploymentPath}/`);

    // Start the application
    await this.startApplication();

    logger.info('Rollback completed');
  }
}

// Run deployment
if (require.main === module) {
  const deployer = new Deployer();
  deployer.deploy();
}

module.exports = Deployer;
