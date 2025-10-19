/**
 * Elephant Exhibit Management System
 * This module handles all operations related to the elephant exhibit
 */

const { Animal } = require('../models/Animal');
const { Exhibit } = require('../models/Exhibit');
const { Feeding } = require('../models/Feeding');
const { HealthRecord } = require('../models/HealthRecord');
const logger = require('../utils/logger');

class ElephantExhibitManager {
    constructor() {
        this.exhibitId = 'elephant-exhibit-001';
        this.capacity = 8;
        this.currentAnimals = [];
        this.feedingSchedule = [];
        this.healthRecords = [];
        this.maintenanceLog = [];
        this.visitorCapacity = 50;
        this.temperature = 22;
        this.humidity = 60;
        this.enrichmentActivities = [];
        this.breedingProgram = null;
    }

    /**
     * Initialize the elephant exhibit with default settings
     * @returns {Promise<Object>} Initialization result
     */
    async initializeExhibit() {
        try {
            logger.info('Initializing elephant exhibit...');
            
            // Set up exhibit parameters
            await this.setupExhibitParameters();
            
            // Initialize feeding schedule
            await this.initializeFeedingSchedule();
            
            // Set up health monitoring
            await this.setupHealthMonitoring();
            
            // Configure enrichment activities
            await this.configureEnrichmentActivities();
            
            logger.info('Elephant exhibit initialized successfully');
            return { success: true, message: 'Exhibit initialized' };
        } catch (error) {
            logger.error('Failed to initialize elephant exhibit:', error);
            throw error;
        }
    }

    /**
     * Add a new elephant to the exhibit
     * @param {Object} elephantData - Elephant information
     * @returns {Promise<Object>} Addition result
     */
    async addElephant(elephantData) {
        try {
            if (this.currentAnimals.length >= this.capacity) {
                throw new Error('Exhibit at maximum capacity');
            }

            const elephant = new Animal({
                ...elephantData,
                species: 'African Elephant',
                exhibitId: this.exhibitId,
                arrivalDate: new Date()
            });

            await elephant.save();
            this.currentAnimals.push(elephant);
            
            // Create initial health record
            await this.createHealthRecord(elephant._id);
            
            logger.info(`Added elephant ${elephant.name} to exhibit`);
            return { success: true, elephant: elephant };
        } catch (error) {
            logger.error('Failed to add elephant:', error);
            throw error;
        }
    }

    /**
     * Remove an elephant from the exhibit
     * @param {string} elephantId - Elephant ID
     * @returns {Promise<Object>} Removal result
     */
    async removeElephant(elephantId) {
        try {
            const elephantIndex = this.currentAnimals.findIndex(
                animal => animal._id.toString() === elephantId
            );

            if (elephantIndex === -1) {
                throw new Error('Elephant not found in exhibit');
            }

            const elephant = this.currentAnimals[elephantIndex];
            this.currentAnimals.splice(elephantIndex, 1);
            
            // Update elephant status
            elephant.status = 'transferred';
            elephant.departureDate = new Date();
            await elephant.save();
            
            logger.info(`Removed elephant ${elephant.name} from exhibit`);
            return { success: true, elephant: elephant };
        } catch (error) {
            logger.error('Failed to remove elephant:', error);
            throw error;
        }
    }

    /**
     * Schedule feeding for elephants
     * @param {Object} feedingData - Feeding information
     * @returns {Promise<Object>} Feeding schedule result
     */
    async scheduleFeeding(feedingData) {
        try {
            const feeding = new Feeding({
                ...feedingData,
                exhibitId: this.exhibitId,
                scheduledTime: new Date(feedingData.scheduledTime),
                status: 'scheduled'
            });

            await feeding.save();
            this.feedingSchedule.push(feeding);
            
            logger.info(`Scheduled feeding for ${feedingData.animals.length} elephants`);
            return { success: true, feeding: feeding };
        } catch (error) {
            logger.error('Failed to schedule feeding:', error);
            throw error;
        }
    }

    /**
     * Record health check for elephants
     * @param {string} elephantId - Elephant ID
     * @param {Object} healthData - Health information
     * @returns {Promise<Object>} Health record result
     */
    async recordHealthCheck(elephantId, healthData) {
        try {
            const healthRecord = new HealthRecord({
                animalId: elephantId,
                exhibitId: this.exhibitId,
                ...healthData,
                recordedAt: new Date()
            });

            await healthRecord.save();
            this.healthRecords.push(healthRecord);
            
            logger.info(`Recorded health check for elephant ${elephantId}`);
            return { success: true, healthRecord: healthRecord };
        } catch (error) {
            logger.error('Failed to record health check:', error);
            throw error;
        }
    }

    /**
     * Get exhibit status and statistics
     * @returns {Object} Exhibit status
     */
    getExhibitStatus() {
        return {
            exhibitId: this.exhibitId,
            currentAnimals: this.currentAnimals.length,
            capacity: this.capacity,
            temperature: this.temperature,
            humidity: this.humidity,
            nextFeeding: this.getNextFeeding(),
            healthAlerts: this.getHealthAlerts(),
            maintenanceStatus: this.getMaintenanceStatus()
        };
    }

    /**
     * Get next scheduled feeding
     * @returns {Object|null} Next feeding information
     */
    getNextFeeding() {
        const upcomingFeedings = this.feedingSchedule
            .filter(feeding => feeding.status === 'scheduled')
            .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
        
        return upcomingFeedings.length > 0 ? upcomingFeedings[0] : null;
    }

    /**
     * Get health alerts for elephants
     * @returns {Array} Health alerts
     */
    getHealthAlerts() {
        return this.healthRecords
            .filter(record => record.alertLevel === 'high')
            .map(record => ({
                elephantId: record.animalId,
                issue: record.issue,
                recordedAt: record.recordedAt
            }));
    }

    /**
     * Get maintenance status
     * @returns {Object} Maintenance status
     */
    getMaintenanceStatus() {
        const lastMaintenance = this.maintenanceLog
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        return {
            lastMaintenance: lastMaintenance?.date || null,
            nextScheduled: this.getNextMaintenance(),
            issues: this.maintenanceLog.filter(log => log.status === 'pending')
        };
    }

    /**
     * Get next scheduled maintenance
     * @returns {Date|null} Next maintenance date
     */
    getNextMaintenance() {
        // Calculate next maintenance (every 30 days)
        const lastMaintenance = this.maintenanceLog
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        if (!lastMaintenance) return new Date();
        
        const nextDate = new Date(lastMaintenance.date);
        nextDate.setDate(nextDate.getDate() + 30);
        return nextDate;
    }

    /**
     * Update exhibit environmental conditions
     * @param {Object} conditions - Environmental conditions
     * @returns {Promise<Object>} Update result
     */
    async updateEnvironmentalConditions(conditions) {
        try {
            if (conditions.temperature !== undefined) {
                this.temperature = conditions.temperature;
            }
            if (conditions.humidity !== undefined) {
                this.humidity = conditions.humidity;
            }
            
            logger.info('Updated environmental conditions for elephant exhibit');
            return { success: true, conditions: { temperature: this.temperature, humidity: this.humidity } };
        } catch (error) {
            logger.error('Failed to update environmental conditions:', error);
            throw error;
        }
    }

    /**
     * Setup exhibit parameters
     * @returns {Promise<void>}
     */
    async setupExhibitParameters() {
        // Configure exhibit-specific parameters
        this.temperature = 22;
        this.humidity = 60;
        this.visitorCapacity = 50;
        this.capacity = 8;
    }

    /**
     * Initialize feeding schedule
     * @returns {Promise<void>}
     */
    async initializeFeedingSchedule() {
        // Set up default feeding times
        const defaultFeedings = [
            { time: '08:00', type: 'morning', food: 'hay and vegetables' },
            { time: '14:00', type: 'afternoon', food: 'fruits and supplements' },
            { time: '18:00', type: 'evening', food: 'hay and water' }
        ];
        
        this.feedingSchedule = defaultFeedings;
    }

    /**
     * Setup health monitoring
     * @returns {Promise<void>}
     */
    async setupHealthMonitoring() {
        // Initialize health monitoring systems
        this.healthRecords = [];
        this.healthAlerts = [];
    }

    /**
     * Configure enrichment activities
     * @returns {Promise<void>}
     */
    async configureEnrichmentActivities() {
        this.enrichmentActivities = [
            'puzzle feeders',
            'water play',
            'social interaction',
            'training sessions',
            'exploration activities'
        ];
    }

    /**
     * Create health record for new elephant
     * @param {string} elephantId - Elephant ID
     * @returns {Promise<void>}
     */
    async createHealthRecord(elephantId) {
        const initialHealthRecord = new HealthRecord({
            animalId: elephantId,
            exhibitId: this.exhibitId,
            weight: 0,
            temperature: 0,
            heartRate: 0,
            notes: 'Initial health assessment',
            recordedAt: new Date()
        });
        
        await initialHealthRecord.save();
        this.healthRecords.push(initialHealthRecord);
    }
}

module.exports = ElephantExhibitManager;
