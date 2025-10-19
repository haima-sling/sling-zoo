/**
 * Hippo-haven Management System
 * Comprehensive management for the hippo-haven exhibit
 */

const { Animal } = require('../models/Animal');
const { Exhibit } = require('../models/Exhibit');
const { Feeding } = require('../models/Feeding');
const { HealthRecord } = require('../models/HealthRecord');
const logger = require('../utils/logger');

class Hippo-havenManager {
    constructor() {
        this.exhibitId = 'hippo-haven-001';
        this.capacity = 10;
        this.currentAnimals = [];
        this.feedingSchedule = [];
        this.healthRecords = [];
        this.enrichmentActivities = [];
        this.breedingProgram = null;
        this.visitorCapacity = 50;
        this.temperature = 22;
        this.humidity = 60;
        this.safetyProtocols = [];
        this.maintenanceSchedule = [];
        this.breedingRecords = [];
        this.healthAlerts = [];
        this.feedingMetrics = {
            totalFeedings: 0,
            successfulFeedings: 0,
            averageDuration: 0
        };
        this.environmentalControls = {
            temperature: 22,
            humidity: 60,
            lighting: 'natural',
            ventilation: 'optimal'
        };
        this.visitorEngagement = {
            viewingAreas: [],
            educationalContent: [],
            interactiveElements: []
        };
    }

    /**
     * Initialize the hippo-haven exhibit
     * @returns {Promise<Object>} Initialization result
     */
    async initializeExhibit() {
        try {
            logger.info('Initializing hippo-haven exhibit...');
            
            // Set up exhibit parameters
            await this.setupExhibitParameters();
            
            // Initialize feeding schedule
            await this.initializeFeedingSchedule();
            
            // Set up health monitoring
            await this.setupHealthMonitoring();
            
            // Configure enrichment activities
            await this.configureEnrichmentActivities();
            
            // Set up safety protocols
            await this.setupSafetyProtocols();
            
            logger.info('hippo-haven exhibit initialized successfully');
            return { success: true, message: 'Exhibit initialized' };
        } catch (error) {
            logger.error('Failed to initialize hippo-haven exhibit:', error);
            throw error;
        }
    }

    /**
     * Add a new animal to the exhibit
     * @param {Object} animalData - Animal information
     * @returns {Promise<Object>} Addition result
     */
    async addAnimal(animalData) {
        try {
            if (this.currentAnimals.length >= this.capacity) {
                throw new Error('Exhibit at maximum capacity');
            }

            const animal = new Animal({
                ...animalData,
                exhibitId: this.exhibitId,
                arrivalDate: new Date()
            });

            await animal.save();
            this.currentAnimals.push(animal);
            
            // Create initial health record
            await this.createHealthRecord(animal._id);
            
            logger.info(`Added animal ${animal.name} to exhibit`);
            return { success: true, animal: animal };
        } catch (error) {
            logger.error('Failed to add animal:', error);
            throw error;
        }
    }

    /**
     * Remove an animal from the exhibit
     * @param {string} animalId - Animal ID
     * @returns {Promise<Object>} Removal result
     */
    async removeAnimal(animalId) {
        try {
            const animalIndex = this.currentAnimals.findIndex(
                animal => animal._id.toString() === animalId
            );

            if (animalIndex === -1) {
                throw new Error('Animal not found in exhibit');
            }

            const animal = this.currentAnimals[animalIndex];
            this.currentAnimals.splice(animalIndex, 1);
            
            // Update animal status
            animal.status = 'transferred';
            animal.departureDate = new Date();
            await animal.save();
            
            logger.info(`Removed animal ${animal.name} from exhibit`);
            return { success: true, animal: animal };
        } catch (error) {
            logger.error('Failed to remove animal:', error);
            throw error;
        }
    }

    /**
     * Schedule feeding for animals
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
            
            logger.info(`Scheduled feeding for ${feedingData.animals.length} animals`);
            return { success: true, feeding: feeding };
        } catch (error) {
            logger.error('Failed to schedule feeding:', error);
            throw error;
        }
    }

    /**
     * Record health check for animals
     * @param {string} animalId - Animal ID
     * @param {Object} healthData - Health information
     * @returns {Promise<Object>} Health record result
     */
    async recordHealthCheck(animalId, healthData) {
        try {
            const healthRecord = new HealthRecord({
                animalId: animalId,
                exhibitId: this.exhibitId,
                ...healthData,
                recordedAt: new Date()
            });

            await healthRecord.save();
            this.healthRecords.push(healthRecord);
            
            logger.info(`Recorded health check for animal ${animalId}`);
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
     * Get health alerts for animals
     * @returns {Array} Health alerts
     */
    getHealthAlerts() {
        return this.healthRecords
            .filter(record => record.alertLevel === 'high')
            .map(record => ({
                animalId: record.animalId,
                issue: record.issue,
                recordedAt: record.recordedAt
            }));
    }

    /**
     * Get maintenance status
     * @returns {Object} Maintenance status
     */
    getMaintenanceStatus() {
        const lastMaintenance = this.maintenanceSchedule
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        return {
            lastMaintenance: lastMaintenance?.date || null,
            nextScheduled: this.getNextMaintenance(),
            issues: this.maintenanceSchedule.filter(log => log.status === 'pending')
        };
    }

    /**
     * Get next scheduled maintenance
     * @returns {Date|null} Next maintenance date
     */
    getNextMaintenance() {
        const lastMaintenance = this.maintenanceSchedule
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
            
            logger.info('Updated environmental conditions for hippo-haven exhibit');
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
        this.temperature = 22;
        this.humidity = 60;
        this.visitorCapacity = 50;
        this.capacity = 10;
    }

    /**
     * Initialize feeding schedule
     * @returns {Promise<void>}
     */
    async initializeFeedingSchedule() {
        const defaultFeedings = [
            { time: '08:00', type: 'morning', food: 'primary_diet' },
            { time: '14:00', type: 'afternoon', food: 'supplements' },
            { time: '18:00', type: 'evening', food: 'enrichment_food' }
        ];
        
        this.feedingSchedule = defaultFeedings;
    }

    /**
     * Setup health monitoring
     * @returns {Promise<void>}
     */
    async setupHealthMonitoring() {
        this.healthRecords = [];
        this.healthAlerts = [];
    }

    /**
     * Configure enrichment activities
     * @returns {Promise<void>}
     */
    async configureEnrichmentActivities() {
        this.enrichmentActivities = [
            'puzzle_feeders',
            'environmental_enrichment',
            'social_interaction',
            'training_sessions',
            'exploration_activities'
        ];
    }

    /**
     * Setup safety protocols
     * @returns {Promise<void>}
     */
    async setupSafetyProtocols() {
        this.safetyProtocols = [
            'visitor_safety_guidelines',
            'staff_safety_protocols',
            'emergency_procedures',
            'animal_handling_guidelines'
        ];
    }

    /**
     * Create health record for new animal
     * @param {string} animalId - Animal ID
     * @returns {Promise<void>}
     */
    async createHealthRecord(animalId) {
        const initialHealthRecord = new HealthRecord({
            animalId: animalId,
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

module.exports = Hippo-havenManager;
