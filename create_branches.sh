#!/bin/bash

# Zoo Branch Creation Script
# Creates 30 branches with zoo-related names and commits

# Array of zoo-related branch names
branches=(
    "elephant-exhibit"
    "lion-kingdom" 
    "penguin-parade"
    "giraffe-tower"
    "monkey-manor"
    "tiger-territory"
    "bear-forest"
    "zebra-plains"
    "hippo-haven"
    "rhino-ridge"
    "kangaroo-court"
    "panda-palace"
    "wolf-pack"
    "eagle-eyrie"
    "otter-otters"
    "seal-sanctuary"
    "dolphin-dome"
    "shark-tank"
    "turtle-terrace"
    "snake-serenity"
    "bird-aviary"
    "butterfly-garden"
    "reptile-realm"
    "amphibian-arcade"
    "insect-institute"
    "fish-fantasy"
    "coral-kingdom"
    "jellyfish-junction"
    "starfish-station"
    "seahorse-stable"
)

# Function to create files for each branch
create_branch_files() {
    local branch_name=$1
    local branch_num=$2
    
    echo "Creating files for branch: $branch_name"
    
    # Create first file
    cat > "src/exhibits/${branch_name}-main.js" << EOF
/**
 * ${branch_name^} Management System
 * Comprehensive management for the ${branch_name} exhibit
 */

const { Animal } = require('../models/Animal');
const { Exhibit } = require('../models/Exhibit');
const { Feeding } = require('../models/Feeding');
const { HealthRecord } = require('../models/HealthRecord');
const logger = require('../utils/logger');

class ${branch_name^}Manager {
    constructor() {
        this.exhibitId = '${branch_name}-001';
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
     * Initialize the ${branch_name} exhibit
     * @returns {Promise<Object>} Initialization result
     */
    async initializeExhibit() {
        try {
            logger.info('Initializing ${branch_name} exhibit...');
            
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
            
            logger.info('${branch_name} exhibit initialized successfully');
            return { success: true, message: 'Exhibit initialized' };
        } catch (error) {
            logger.error('Failed to initialize ${branch_name} exhibit:', error);
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
            
            logger.info(\`Added animal \${animal.name} to exhibit\`);
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
            
            logger.info(\`Removed animal \${animal.name} from exhibit\`);
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
            
            logger.info(\`Scheduled feeding for \${feedingData.animals.length} animals\`);
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
            
            logger.info(\`Recorded health check for animal \${animalId}\`);
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
            
            logger.info('Updated environmental conditions for ${branch_name} exhibit');
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

module.exports = ${branch_name^}Manager;
EOF

    # Create second file
    cat > "src/exhibits/${branch_name}-care.js" << EOF
/**
 * ${branch_name^} Care Management System
 * Specialized care routines and health monitoring for ${branch_name}
 */

const { HealthRecord } = require('../models/HealthRecord');
const { Animal } = require('../models/Animal');
const logger = require('../utils/logger');

class ${branch_name^}CareManager {
    constructor() {
        this.careProtocols = [];
        this.healthMonitoring = new Map();
        this.medicalSupplies = new Map();
        this.veterinaryContacts = [];
        this.healthMetrics = {
            normal: {
                temperature: { min: 36.5, max: 37.5 },
                heartRate: { min: 60, max: 120 },
                respiratoryRate: { min: 12, max: 20 },
                weight: { min: 10, max: 100 }
            }
        };
        this.careSchedule = [];
        this.medicationSchedule = new Map();
        this.enrichmentActivities = [];
        this.behavioralMonitoring = [];
        this.nutritionalNeeds = {
            daily: { protein: 0, carbohydrates: 0, fats: 0, vitamins: 0 },
            weekly: { supplements: [], specialDiet: [] },
            seasonal: { adjustments: [] }
        };
        this.breedingCare = {
            preBreeding: [],
            duringBreeding: [],
            postBreeding: []
        };
        this.emergencyProtocols = [];
        this.quarantineProcedures = [];
    }

    /**
     * Perform comprehensive health assessment
     * @param {string} animalId - Animal ID
     * @param {Object} assessmentData - Health assessment data
     * @returns {Promise<Object>} Assessment result
     */
    async performHealthAssessment(animalId, assessmentData) {
        try {
            const assessment = {
                animalId: animalId,
                assessmentDate: new Date(),
                vitalSigns: this.recordVitalSigns(assessmentData.vitalSigns),
                physicalExam: this.performPhysicalExam(assessmentData.physicalExam),
                behavioralObservations: assessmentData.behavioralObservations,
                nutritionalStatus: this.assessNutritionalStatus(assessmentData.nutritionalStatus),
                overallHealthScore: 0,
                recommendations: [],
                followUpRequired: false
            };

            assessment.overallHealthScore = this.calculateHealthScore(assessment);
            assessment.recommendations = this.generateRecommendations(assessment);
            assessment.followUpRequired = this.requiresFollowUp(assessment);

            await this.saveHealthAssessment(animalId, assessment);
            await this.checkHealthAlerts(animalId, assessment);
            
            logger.info(\`Completed health assessment for animal \${animalId}\`);
            return assessment;
        } catch (error) {
            logger.error('Failed to perform health assessment:', error);
            throw error;
        }
    }

    /**
     * Record vital signs with validation
     * @param {Object} vitalSigns - Vital signs data
     * @returns {Object} Recorded vital signs
     */
    recordVitalSigns(vitalSigns) {
        const recorded = {
            temperature: vitalSigns.temperature,
            heartRate: vitalSigns.heartRate,
            respiratoryRate: vitalSigns.respiratoryRate,
            bloodPressure: vitalSigns.bloodPressure,
            weight: vitalSigns.weight,
            recordedAt: new Date(),
            status: 'normal'
        };

        if (recorded.temperature < this.healthMetrics.normal.temperature.min || 
            recorded.temperature > this.healthMetrics.normal.temperature.max) {
            recorded.status = 'abnormal';
            recorded.temperatureAlert = 'Temperature outside normal range';
        }

        if (recorded.heartRate < this.healthMetrics.normal.heartRate.min || 
            recorded.heartRate > this.healthMetrics.normal.heartRate.max) {
            recorded.status = 'abnormal';
            recorded.heartRateAlert = 'Heart rate outside normal range';
        }

        return recorded;
    }

    /**
     * Perform physical examination
     * @param {Object} physicalExam - Physical exam data
     * @returns {Object} Exam results
     */
    performPhysicalExam(physicalExam) {
        return {
            eyes: {
                condition: physicalExam.eyes.condition,
                vision: physicalExam.eyes.vision,
                abnormalities: physicalExam.eyes.abnormalities || []
            },
            ears: {
                condition: physicalExam.ears.condition,
                hearing: physicalExam.ears.hearing,
                abnormalities: physicalExam.ears.abnormalities || []
            },
            body: {
                condition: physicalExam.body.condition,
                mobility: physicalExam.body.mobility,
                abnormalities: physicalExam.body.abnormalities || []
            },
            overallCondition: physicalExam.overallCondition,
            abnormalities: physicalExam.abnormalities || []
        };
    }

    /**
     * Assess nutritional status
     * @param {Object} nutritionalStatus - Nutritional data
     * @returns {Object} Assessment result
     */
    assessNutritionalStatus(nutritionalStatus) {
        return {
            bodyCondition: nutritionalStatus.bodyCondition,
            weightTrend: nutritionalStatus.weightTrend,
            appetite: nutritionalStatus.appetite,
            hydration: nutritionalStatus.hydration,
            supplementCompliance: nutritionalStatus.supplementCompliance,
            recommendations: this.generateNutritionalRecommendations(nutritionalStatus)
        };
    }

    /**
     * Calculate overall health score
     * @param {Object} assessment - Complete health assessment
     * @returns {number} Health score (0-100)
     */
    calculateHealthScore(assessment) {
        let score = 100;
        
        if (assessment.vitalSigns.status === 'abnormal') score -= 20;
        if (assessment.physicalExam.abnormalities.length > 0) score -= 15;
        if (assessment.nutritionalStatus.bodyCondition !== 'excellent') score -= 10;
        
        return Math.max(0, score);
    }

    /**
     * Generate health recommendations
     * @param {Object} assessment - Health assessment
     * @returns {Array} Recommendations
     */
    generateRecommendations(assessment) {
        const recommendations = [];
        
        if (assessment.vitalSigns.status === 'abnormal') {
            recommendations.push('Monitor vital signs closely');
        }
        
        if (assessment.nutritionalStatus.bodyCondition !== 'excellent') {
            recommendations.push('Adjust diet and feeding schedule');
        }
        
        if (assessment.physicalExam.abnormalities.length > 0) {
            recommendations.push('Schedule follow-up examination');
        }
        
        return recommendations;
    }

    /**
     * Check if follow-up is required
     * @param {Object} assessment - Health assessment
     * @returns {boolean} Follow-up required
     */
    requiresFollowUp(assessment) {
        return assessment.overallHealthScore < 80 || 
               assessment.vitalSigns.status === 'abnormal' ||
               assessment.physicalExam.abnormalities.length > 2;
    }

    /**
     * Save health assessment
     * @param {string} animalId - Animal ID
     * @param {Object} assessment - Health assessment
     * @returns {Promise<void>}
     */
    async saveHealthAssessment(animalId, assessment) {
        const healthRecord = new HealthRecord({
            animalId: animalId,
            exhibitId: '${branch_name}-001',
            assessmentType: 'comprehensive',
            ...assessment,
            recordedAt: new Date()
        });
        
        await healthRecord.save();
        this.healthMonitoring.set(animalId, assessment);
    }

    /**
     * Check for health alerts
     * @param {string} animalId - Animal ID
     * @param {Object} assessment - Health assessment
     * @returns {Promise<void>}
     */
    async checkHealthAlerts(animalId, assessment) {
        if (assessment.overallHealthScore < 70) {
            this.healthAlerts.push({
                animalId: animalId,
                alertType: 'critical',
                message: 'Critical health condition detected',
                assessmentDate: assessment.assessmentDate,
                score: assessment.overallHealthScore
            });
        } else if (assessment.overallHealthScore < 80) {
            this.healthAlerts.push({
                animalId: animalId,
                alertType: 'warning',
                message: 'Health condition requires attention',
                assessmentDate: assessment.assessmentDate,
                score: assessment.overallHealthScore
            });
        }
    }

    /**
     * Generate nutritional recommendations
     * @param {Object} nutritionalStatus - Nutritional status
     * @returns {Array} Recommendations
     */
    generateNutritionalRecommendations(nutritionalStatus) {
        const recommendations = [];
        
        if (nutritionalStatus.bodyCondition === 'underweight') {
            recommendations.push('Increase caloric intake');
        } else if (nutritionalStatus.bodyCondition === 'overweight') {
            recommendations.push('Implement weight management program');
        }
        
        if (nutritionalStatus.hydration === 'poor') {
            recommendations.push('Increase water intake and monitor hydration');
        }
        
        return recommendations;
    }

    /**
     * Get care statistics
     * @returns {Object} Care statistics
     */
    getCareStatistics() {
        return {
            totalAssessments: this.healthMonitoring.size,
            healthAlerts: this.healthAlerts.length,
            careProtocols: this.careProtocols.length,
            enrichmentActivities: this.enrichmentActivities.length
        };
    }
}

module.exports = ${branch_name^}CareManager;
EOF

    # Create third file
    cat > "src/exhibits/${branch_name}-breeding.js" << EOF
/**
 * ${branch_name^} Breeding Program Management System
 * Comprehensive breeding program management for ${branch_name} conservation
 */

const { Animal } = require('../models/Animal');
const { HealthRecord } = require('../models/HealthRecord');
const logger = require('../utils/logger');

class ${branch_name^}BreedingManager {
    constructor() {
        this.breedingProgram = {
            name: '${branch_name^} Conservation Breeding',
            startDate: new Date(),
            objectives: [],
            participants: [],
            breedingPairs: [],
            offspring: [],
            geneticDiversity: new Map(),
            breedingSeasons: []
        };
        this.geneticDatabase = new Map();
        this.breedingRecords = [];
        this.healthMonitoring = new Map();
        this.conservationGoals = {
            geneticDiversity: 0.95,
            populationSize: 50,
            breedingSuccess: 0.8,
            offspringSurvival: 0.9
        };
        this.enrichmentActivities = [];
        this.veterinaryCare = [];
        this.breedingFacilities = {
            breedingEnclosures: [],
            nurseryAreas: [],
            quarantineZones: [],
            medicalFacilities: []
        };
        this.breedingMetrics = {
            totalBreedingAttempts: 0,
            successfulBreedings: 0,
            offspringProduced: 0,
            geneticDiversityScore: 0
        };
    }

    /**
     * Initialize breeding program
     * @param {Object} programData - Breeding program data
     * @returns {Promise<Object>} Initialization result
     */
    async initializeBreedingProgram(programData) {
        try {
            logger.info('Initializing ${branch_name} breeding program...');
            
            await this.setupBreedingProgram(programData);
            await this.initializeGeneticDatabase();
            await this.configureBreedingFacilities();
            await this.setupHealthMonitoring();
            await this.createBreedingSeasonSchedule();
            
            logger.info('${branch_name} breeding program initialized successfully');
            return { success: true, program: this.breedingProgram };
        } catch (error) {
            logger.error('Failed to initialize breeding program:', error);
            throw error;
        }
    }

    /**
     * Add breeding pair to program
     * @param {Object} pairData - Breeding pair information
     * @returns {Promise<Object>} Addition result
     */
    async addBreedingPair(pairData) {
        try {
            const pair = {
                id: this.generatePairId(),
                male: pairData.male,
                female: pairData.female,
                compatibility: await this.calculateCompatibility(pairData.male, pairData.female),
                breedingHistory: [],
                geneticDiversity: await this.calculateGeneticDiversity(pairData.male, pairData.female),
                healthStatus: await this.assessHealthStatus(pairData.male, pairData.female),
                breedingPotential: await this.assessBreedingPotential(pairData.male, pairData.female),
                addedDate: new Date(),
                status: 'active'
            };

            this.breedingProgram.breedingPairs.push(pair);
            await this.saveBreedingPair(pair);
            
            logger.info(\`Added breeding pair: \${pair.id}\`);
            return { success: true, pair: pair };
        } catch (error) {
            logger.error('Failed to add breeding pair:', error);
            throw error;
        }
    }

    /**
     * Plan breeding season
     * @param {Object} seasonData - Breeding season data
     * @returns {Promise<Object>} Season planning result
     */
    async planBreedingSeason(seasonData) {
        try {
            const season = {
                id: this.generateSeasonId(),
                year: seasonData.year,
                startDate: new Date(seasonData.startDate),
                endDate: new Date(seasonData.endDate),
                participatingPairs: await this.selectBreedingPairs(seasonData.criteria),
                objectives: seasonData.objectives || [],
                monitoringSchedule: await this.createMonitoringSchedule(seasonData.duration),
                expectedOffspring: await this.calculateExpectedOffspring(seasonData.participatingPairs),
                successMetrics: await this.defineSuccessMetrics(seasonData),
                status: 'planned'
            };

            this.breedingProgram.breedingSeasons.push(season);
            await this.saveBreedingSeason(season);
            
            logger.info(\`Planned breeding season: \${season.id}\`);
            return { success: true, season: season };
        } catch (error) {
            logger.error('Failed to plan breeding season:', error);
            throw error;
        }
    }

    /**
     * Record breeding attempt
     * @param {string} pairId - Breeding pair ID
     * @param {Object} attemptData - Breeding attempt data
     * @returns {Promise<Object>} Recording result
     */
    async recordBreedingAttempt(pairId, attemptData) {
        try {
            const pair = this.breedingProgram.breedingPairs.find(p => p.id === pairId);
            if (!pair) {
                throw new Error('Breeding pair not found');
            }

            const attempt = {
                id: this.generateAttemptId(),
                pairId: pairId,
                date: new Date(attemptData.date),
                location: attemptData.location,
                duration: attemptData.duration,
                behavior: attemptData.behavior,
                success: attemptData.success,
                observations: attemptData.observations,
                healthChecks: await this.performHealthChecks(pair.male, pair.female),
                environmentalFactors: attemptData.environmentalFactors,
                staffInvolved: attemptData.staffInvolved
            };

            pair.breedingHistory.push(attempt);
            this.breedingRecords.push(attempt);
            await this.saveBreedingAttempt(attempt);
            
            logger.info(\`Recorded breeding attempt: \${attempt.id}\`);
            return { success: true, attempt: attempt };
        } catch (error) {
            logger.error('Failed to record breeding attempt:', error);
            throw error;
        }
    }

    /**
     * Calculate genetic compatibility
     * @param {Object} male - Male animal data
     * @param {Object} female - Female animal data
     * @returns {Promise<number>} Compatibility score
     */
    async calculateCompatibility(male, female) {
        const geneticDistance = this.calculateGeneticDistance(male.genetics, female.genetics);
        const ageCompatibility = this.calculateAgeCompatibility(male.age, female.age);
        const healthCompatibility = this.calculateHealthCompatibility(male.health, female.health);
        const behavioralCompatibility = this.calculateBehavioralCompatibility(male.behavior, female.behavior);
        
        return (geneticDistance * 0.4) + (ageCompatibility * 0.2) + 
               (healthCompatibility * 0.2) + (behavioralCompatibility * 0.2);
    }

    /**
     * Calculate genetic diversity
     * @param {Object} male - Male animal genetics
     * @param {Object} female - Female animal genetics
     * @returns {Promise<number>} Genetic diversity score
     */
    async calculateGeneticDiversity(male, female) {
        const maleGenes = male.genetics.alleles;
        const femaleGenes = female.genetics.alleles;
        
        let diversity = 0;
        const genePairs = Math.min(maleGenes.length, femaleGenes.length);
        
        for (let i = 0; i < genePairs; i++) {
            if (maleGenes[i] !== femaleGenes[i]) {
                diversity += 1;
            }
        }
        
        return diversity / genePairs;
    }

    /**
     * Assess breeding potential
     * @param {Object} male - Male animal data
     * @param {Object} female - Female animal data
     * @returns {Promise<Object>} Breeding potential assessment
     */
    async assessBreedingPotential(male, female) {
        return {
            male: {
                fertility: male.health.reproductive.fertility,
                age: male.age,
                breedingExperience: male.breedingHistory.length,
                geneticQuality: male.genetics.quality
            },
            female: {
                fertility: female.health.reproductive.fertility,
                age: female.age,
                breedingExperience: female.breedingHistory.length,
                geneticQuality: female.genetics.quality
            },
            combined: {
                geneticDiversity: await this.calculateGeneticDiversity(male, female),
                compatibility: await this.calculateCompatibility(male, female),
                breedingSuccess: this.calculateBreedingSuccess(male, female)
            }
        };
    }

    /**
     * Setup breeding program
     * @param {Object} programData - Program data
     * @returns {Promise<void>}
     */
    async setupBreedingProgram(programData) {
        this.breedingProgram.name = programData.name || '${branch_name^} Conservation Breeding';
        this.breedingProgram.objectives = programData.objectives || [];
    }

    /**
     * Initialize genetic database
     * @returns {Promise<void>}
     */
    async initializeGeneticDatabase() {
        this.geneticDatabase = new Map();
    }

    /**
     * Configure breeding facilities
     * @returns {Promise<void>}
     */
    async configureBreedingFacilities() {
        this.breedingFacilities = {
            breedingEnclosures: [],
            nurseryAreas: [],
            quarantineZones: [],
            medicalFacilities: []
        };
    }

    /**
     * Setup health monitoring
     * @returns {Promise<void>}
     */
    async setupHealthMonitoring() {
        this.healthMonitoring = new Map();
    }

    /**
     * Create breeding season schedule
     * @returns {Promise<void>}
     */
    async createBreedingSeasonSchedule() {
        this.breedingProgram.breedingSeasons = [];
    }

    /**
     * Generate unique IDs
     */
    generatePairId() {
        return \`pair_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    }

    generateSeasonId() {
        return \`season_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    }

    generateAttemptId() {
        return \`attempt_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    }

    /**
     * Save methods (placeholder implementations)
     */
    async saveBreedingPair(pair) {
        logger.info(\`Saved breeding pair: \${pair.id}\`);
    }

    async saveBreedingSeason(season) {
        logger.info(\`Saved breeding season: \${season.id}\`);
    }

    async saveBreedingAttempt(attempt) {
        logger.info(\`Saved breeding attempt: \${attempt.id}\`);
    }
}

module.exports = ${branch_name^}BreedingManager;
EOF
}

# Main execution
echo "Starting branch creation process..."

# Create all branches
for i in "${!branches[@]}"; do
    branch_name="${branches[$i]}"
    branch_num=$((i + 1))
    
    echo "Processing branch $branch_num: $branch_name"
    
    # Create and checkout branch
    git checkout -b "$branch_name"
    
    # Create files for this branch
    create_branch_files "$branch_name" "$branch_num"
    
    # Make commits
    git add .
    git commit -m "Add ${branch_name^} management system with core functionality for animal care, feeding schedules, and health monitoring"
    
    git add .
    git commit -m "Implement specialized ${branch_name} care management with health monitoring, nutritional planning, and behavioral tracking"
    
    git add .
    git commit -m "Develop comprehensive ${branch_name} breeding program with genetic diversity tracking, breeding season planning, and conservation goals"
    
    echo "Completed branch: $branch_name"
done

echo "All branches created successfully!"
echo "Total branches created: ${#branches[@]}"
