/**
 * Lion Kingdom Management System
 * Comprehensive management for the lion exhibit and pride dynamics
 */

const { Animal } = require('../models/Animal');
const { Exhibit } = require('../models/Exhibit');
const { Feeding } = require('../models/Feeding');
const { HealthRecord } = require('../models/HealthRecord');
const logger = require('../utils/logger');

class LionKingdomManager {
    constructor() {
        this.exhibitId = 'lion-kingdom-001';
        this.prideStructure = {
            alphaMale: null,
            alphaFemale: null,
            prideMembers: [],
            cubs: [],
            juveniles: []
        };
        this.territory = {
            size: 5000, // square meters
            boundaries: [],
            huntingGrounds: [],
            restingAreas: [],
            waterSources: []
        };
        this.feedingSchedule = [];
        this.breedingProgram = null;
        this.enrichmentActivities = [];
        this.visitorSafety = {
            barriers: [],
            viewingAreas: [],
            emergencyProtocols: []
        };
        this.healthMonitoring = {
            dailyChecks: [],
            medicalRecords: [],
            vaccinationSchedule: []
        };
    }

    /**
     * Initialize the lion kingdom exhibit
     * @returns {Promise<Object>} Initialization result
     */
    async initializeLionKingdom() {
        try {
            logger.info('Initializing Lion Kingdom exhibit...');
            
            // Set up pride structure
            await this.establishPrideStructure();
            
            // Configure territory
            await this.configureTerritory();
            
            // Initialize feeding system
            await this.initializeFeedingSystem();
            
            // Set up safety protocols
            await this.setupSafetyProtocols();
            
            // Configure enrichment activities
            await this.configureEnrichmentActivities();
            
            logger.info('Lion Kingdom exhibit initialized successfully');
            return { success: true, message: 'Lion Kingdom initialized' };
        } catch (error) {
            logger.error('Failed to initialize Lion Kingdom:', error);
            throw error;
        }
    }

    /**
     * Add a lion to the pride
     * @param {Object} lionData - Lion information
     * @returns {Promise<Object>} Addition result
     */
    async addLionToPride(lionData) {
        try {
            const lion = new Animal({
                ...lionData,
                species: 'African Lion',
                exhibitId: this.exhibitId,
                prideRole: this.determinePrideRole(lionData),
                arrivalDate: new Date()
            });

            await lion.save();
            
            // Add to appropriate pride category
            await this.assignToPrideCategory(lion);
            
            // Update pride dynamics
            await this.updatePrideDynamics();
            
            logger.info(`Added lion ${lion.name} to pride`);
            return { success: true, lion: lion };
        } catch (error) {
            logger.error('Failed to add lion to pride:', error);
            throw error;
        }
    }

    /**
     * Establish pride structure and hierarchy
     * @returns {Promise<void>}
     */
    async establishPrideStructure() {
        // Initialize pride structure
        this.prideStructure = {
            alphaMale: null,
            alphaFemale: null,
            prideMembers: [],
            cubs: [],
            juveniles: []
        };
        
        // Set up dominance hierarchy
        this.dominanceHierarchy = [];
        
        // Configure social dynamics
        this.socialDynamics = {
            grooming: [],
            play: [],
            territorial: [],
            mating: []
        };
    }

    /**
     * Configure territory and habitat
     * @returns {Promise<void>}
     */
    async configureTerritory() {
        this.territory = {
            size: 5000,
            boundaries: [
                { type: 'fence', height: 4, material: 'steel' },
                { type: 'moat', width: 3, depth: 2 },
                { type: 'barrier', material: 'concrete' }
            ],
            huntingGrounds: [
                { area: 'north_meadow', size: 1000, features: ['trees', 'rocks'] },
                { area: 'south_plains', size: 1500, features: ['grass', 'water'] }
            ],
            restingAreas: [
                { area: 'shade_grove', size: 500, features: ['trees', 'caves'] },
                { area: 'rock_formation', size: 300, features: ['boulders', 'overhang'] }
            ],
            waterSources: [
                { type: 'pool', size: 200, depth: 1.5 },
                { type: 'stream', length: 100, flow: 'continuous' }
            ]
        };
    }

    /**
     * Initialize feeding system for lions
     * @returns {Promise<void>}
     */
    async initializeFeedingSystem() {
        this.feedingSchedule = [
            {
                time: '06:00',
                type: 'morning_feeding',
                food: 'fresh_meat',
                amount: '15kg',
                method: 'scattered'
            },
            {
                time: '14:00',
                type: 'afternoon_feeding',
                food: 'supplements',
                amount: '2kg',
                method: 'individual'
            },
            {
                time: '18:00',
                type: 'evening_feeding',
                food: 'whole_prey',
                amount: '20kg',
                method: 'enrichment'
            }
        ];
    }

    /**
     * Setup safety protocols for visitors and staff
     * @returns {Promise<void>}
     */
    async setupSafetyProtocols() {
        this.visitorSafety = {
            barriers: [
                { type: 'primary', height: 4, material: 'steel' },
                { type: 'secondary', height: 2, material: 'glass' },
                { type: 'emergency', height: 6, material: 'concrete' }
            ],
            viewingAreas: [
                { name: 'main_viewing', capacity: 100, safety: 'high' },
                { name: 'feeding_viewing', capacity: 50, safety: 'medium' },
                { name: 'breeding_viewing', capacity: 25, safety: 'high' }
            ],
            emergencyProtocols: [
                { scenario: 'lion_escape', response: 'immediate_lockdown' },
                { scenario: 'visitor_injury', response: 'medical_evacuation' },
                { scenario: 'pride_conflict', response: 'separation_protocol' }
            ]
        };
    }

    /**
     * Configure enrichment activities for lions
     * @returns {Promise<void>}
     */
    async configureEnrichmentActivities() {
        this.enrichmentActivities = [
            {
                name: 'hunting_simulation',
                frequency: 'daily',
                duration: 30,
                description: 'Simulated prey for hunting practice'
            },
            {
                name: 'puzzle_feeders',
                frequency: 'twice_weekly',
                duration: 45,
                description: 'Mental stimulation through food puzzles'
            },
            {
                name: 'social_enrichment',
                frequency: 'daily',
                duration: 60,
                description: 'Controlled social interactions'
            },
            {
                name: 'environmental_enrichment',
                frequency: 'weekly',
                duration: 120,
                description: 'Changes to habitat and environment'
            }
        ];
    }

    /**
     * Determine pride role for new lion
     * @param {Object} lionData - Lion information
     * @returns {string} Pride role
     */
    determinePrideRole(lionData) {
        if (lionData.age < 2) return 'cub';
        if (lionData.age < 4) return 'juvenile';
        if (lionData.gender === 'male' && lionData.age > 4) return 'pride_male';
        if (lionData.gender === 'female' && lionData.age > 3) return 'pride_female';
        return 'subordinate';
    }

    /**
     * Assign lion to appropriate pride category
     * @param {Object} lion - Lion object
     * @returns {Promise<void>}
     */
    async assignToPrideCategory(lion) {
        switch (lion.prideRole) {
            case 'cub':
                this.prideStructure.cubs.push(lion);
                break;
            case 'juvenile':
                this.prideStructure.juveniles.push(lion);
                break;
            case 'pride_male':
                if (!this.prideStructure.alphaMale) {
                    this.prideStructure.alphaMale = lion;
                } else {
                    this.prideStructure.prideMembers.push(lion);
                }
                break;
            case 'pride_female':
                if (!this.prideStructure.alphaFemale) {
                    this.prideStructure.alphaFemale = lion;
                } else {
                    this.prideStructure.prideMembers.push(lion);
                }
                break;
            default:
                this.prideStructure.prideMembers.push(lion);
        }
    }

    /**
     * Update pride dynamics and hierarchy
     * @returns {Promise<void>}
     */
    async updatePrideDynamics() {
        // Recalculate dominance hierarchy
        this.dominanceHierarchy = this.calculateDominanceHierarchy();
        
        // Update social relationships
        await this.updateSocialRelationships();
        
        // Adjust territory boundaries if needed
        await this.adjustTerritoryBoundaries();
    }

    /**
     * Calculate dominance hierarchy
     * @returns {Array} Dominance hierarchy
     */
    calculateDominanceHierarchy() {
        const hierarchy = [];
        
        // Alpha male is always at the top
        if (this.prideStructure.alphaMale) {
            hierarchy.push({
                rank: 1,
                lion: this.prideStructure.alphaMale,
                role: 'alpha_male'
            });
        }
        
        // Alpha female is second
        if (this.prideStructure.alphaFemale) {
            hierarchy.push({
                rank: 2,
                lion: this.prideStructure.alphaFemale,
                role: 'alpha_female'
            });
        }
        
        // Other pride members follow
        this.prideStructure.prideMembers.forEach((lion, index) => {
            hierarchy.push({
                rank: index + 3,
                lion: lion,
                role: 'pride_member'
            });
        });
        
        return hierarchy;
    }

    /**
     * Update social relationships within pride
     * @returns {Promise<void>}
     */
    async updateSocialRelationships() {
        // Update grooming relationships
        this.socialDynamics.grooming = this.calculateGroomingRelationships();
        
        // Update play relationships
        this.socialDynamics.play = this.calculatePlayRelationships();
        
        // Update territorial relationships
        this.socialDynamics.territorial = this.calculateTerritorialRelationships();
    }

    /**
     * Calculate grooming relationships
     * @returns {Array} Grooming relationships
     */
    calculateGroomingRelationships() {
        const relationships = [];
        
        // Alpha pair grooms each other
        if (this.prideStructure.alphaMale && this.prideStructure.alphaFemale) {
            relationships.push({
                groomer: this.prideStructure.alphaMale,
                recipient: this.prideStructure.alphaFemale,
                frequency: 'daily'
            });
        }
        
        // Adults groom cubs
        this.prideStructure.cubs.forEach(cub => {
            relationships.push({
                groomer: this.prideStructure.alphaFemale,
                recipient: cub,
                frequency: 'multiple_daily'
            });
        });
        
        return relationships;
    }

    /**
     * Calculate play relationships
     * @returns {Array} Play relationships
     */
    calculatePlayRelationships() {
        const relationships = [];
        
        // Cubs play with each other
        for (let i = 0; i < this.prideStructure.cubs.length; i++) {
            for (let j = i + 1; j < this.prideStructure.cubs.length; j++) {
                relationships.push({
                    participants: [this.prideStructure.cubs[i], this.prideStructure.cubs[j]],
                    type: 'social_play',
                    frequency: 'daily'
                });
            }
        }
        
        // Juveniles play with cubs
        this.prideStructure.juveniles.forEach(juvenile => {
            this.prideStructure.cubs.forEach(cub => {
                relationships.push({
                    participants: [juvenile, cub],
                    type: 'mentoring_play',
                    frequency: 'daily'
                });
            });
        });
        
        return relationships;
    }

    /**
     * Calculate territorial relationships
     * @returns {Array} Territorial relationships
     */
    calculateTerritorialRelationships() {
        const relationships = [];
        
        // Alpha male patrols territory
        if (this.prideStructure.alphaMale) {
            relationships.push({
                lion: this.prideStructure.alphaMale,
                territory: 'full_exhibit',
                patrol_frequency: 'daily',
                marking_frequency: 'multiple_daily'
            });
        }
        
        // Alpha female manages pride territory
        if (this.prideStructure.alphaFemale) {
            relationships.push({
                lion: this.prideStructure.alphaFemale,
                territory: 'pride_area',
                patrol_frequency: 'daily',
                marking_frequency: 'daily'
            });
        }
        
        return relationships;
    }

    /**
     * Adjust territory boundaries based on pride size
     * @returns {Promise<void>}
     */
    async adjustTerritoryBoundaries() {
        const totalLions = this.getTotalLionCount();
        
        // Adjust territory size based on pride size
        if (totalLions > 8) {
            this.territory.size = Math.min(8000, this.territory.size * 1.2);
        } else if (totalLions < 4) {
            this.territory.size = Math.max(3000, this.territory.size * 0.8);
        }
    }

    /**
     * Get total lion count in pride
     * @returns {number} Total lion count
     */
    getTotalLionCount() {
        return this.prideStructure.cubs.length + 
               this.prideStructure.juveniles.length + 
               this.prideStructure.prideMembers.length + 
               (this.prideStructure.alphaMale ? 1 : 0) + 
               (this.prideStructure.alphaFemale ? 1 : 0);
    }

    /**
     * Get pride status and statistics
     * @returns {Object} Pride status
     */
    getPrideStatus() {
        return {
            exhibitId: this.exhibitId,
            totalLions: this.getTotalLionCount(),
            prideStructure: this.prideStructure,
            territory: this.territory,
            dominanceHierarchy: this.dominanceHierarchy,
            socialDynamics: this.socialDynamics,
            feedingSchedule: this.feedingSchedule,
            enrichmentActivities: this.enrichmentActivities
        };
    }
}

module.exports = LionKingdomManager;
