/**
 * Elephant Feeding Management System
 * Handles specialized feeding routines and nutrition for elephants
 */

const { Feeding } = require('../models/Feeding');
const { Animal } = require('../models/Animal');
const logger = require('../utils/logger');

class ElephantFeedingManager {
    constructor() {
        this.feedingSchedules = new Map();
        this.nutritionalRequirements = {
            adult: { hay: 50, vegetables: 20, fruits: 10, supplements: 5 },
            juvenile: { hay: 30, vegetables: 15, fruits: 8, supplements: 3 },
            senior: { hay: 40, vegetables: 18, fruits: 6, supplements: 4 }
        };
        this.feedingTimes = ['08:00', '14:00', '18:00'];
        this.specialDiets = new Map();
        this.medicationSchedule = new Map();
    }

    /**
     * Create a comprehensive feeding plan for elephants
     * @param {string} elephantId - Elephant ID
     * @param {Object} elephantData - Elephant information
     * @returns {Promise<Object>} Feeding plan
     */
    async createFeedingPlan(elephantId, elephantData) {
        try {
            const age = this.calculateAge(elephantData.birthDate);
            const nutritionalNeeds = this.calculateNutritionalNeeds(age, elephantData.health);
            
            const feedingPlan = {
                elephantId: elephantId,
                dailyMeals: this.generateDailyMeals(nutritionalNeeds),
                weeklyVariations: this.generateWeeklyVariations(nutritionalNeeds),
                specialRequirements: this.identifySpecialRequirements(elephantData),
                feedingTimes: this.feedingTimes,
                waterRequirements: this.calculateWaterRequirements(elephantData.weight),
                supplements: this.determineSupplements(elephantData.health)
            };

            await this.saveFeedingPlan(elephantId, feedingPlan);
            logger.info(`Created feeding plan for elephant ${elephantId}`);
            return feedingPlan;
        } catch (error) {
            logger.error('Failed to create feeding plan:', error);
            throw error;
        }
    }

    /**
     * Schedule feeding for multiple elephants
     * @param {Array} elephantIds - Array of elephant IDs
     * @param {Object} feedingData - Feeding information
     * @returns {Promise<Object>} Scheduling result
     */
    async scheduleGroupFeeding(elephantIds, feedingData) {
        try {
            const feeding = new Feeding({
                animalIds: elephantIds,
                exhibitId: 'elephant-exhibit-001',
                feedingType: feedingData.type,
                foodItems: feedingData.foodItems,
                scheduledTime: new Date(feedingData.scheduledTime),
                estimatedDuration: feedingData.duration || 60,
                staffRequired: this.calculateStaffRequired(elephantIds.length),
                specialInstructions: feedingData.instructions || '',
                status: 'scheduled'
            });

            await feeding.save();
            logger.info(`Scheduled group feeding for ${elephantIds.length} elephants`);
            return { success: true, feeding: feeding };
        } catch (error) {
            logger.error('Failed to schedule group feeding:', error);
            throw error;
        }
    }

    /**
     * Record feeding completion and observations
     * @param {string} feedingId - Feeding ID
     * @param {Object} observations - Feeding observations
     * @returns {Promise<Object>} Recording result
     */
    async recordFeedingCompletion(feedingId, observations) {
        try {
            const feeding = await Feeding.findById(feedingId);
            if (!feeding) {
                throw new Error('Feeding record not found');
            }

            feeding.status = 'completed';
            feeding.completedAt = new Date();
            feeding.observations = observations;
            feeding.foodConsumed = observations.foodConsumed;
            feeding.behaviorNotes = observations.behaviorNotes;
            feeding.healthObservations = observations.healthObservations;

            await feeding.save();
            logger.info(`Recorded feeding completion for ${feedingId}`);
            return { success: true, feeding: feeding };
        } catch (error) {
            logger.error('Failed to record feeding completion:', error);
            throw error;
        }
    }

    /**
     * Calculate nutritional needs based on age and health
     * @param {number} age - Elephant age in years
     * @param {Object} health - Health status
     * @returns {Object} Nutritional requirements
     */
    calculateNutritionalNeeds(age, health) {
        let category = 'adult';
        if (age < 5) category = 'juvenile';
        if (age > 50) category = 'senior';

        const baseRequirements = this.nutritionalRequirements[category];
        
        // Adjust for health conditions
        if (health.conditions && health.conditions.includes('diabetes')) {
            baseRequirements.fruits *= 0.5;
            baseRequirements.vegetables *= 1.2;
        }
        
        if (health.conditions && health.conditions.includes('arthritis')) {
            baseRequirements.supplements *= 1.5;
        }

        return baseRequirements;
    }

    /**
     * Generate daily meal plans
     * @param {Object} nutritionalNeeds - Nutritional requirements
     * @returns {Array} Daily meals
     */
    generateDailyMeals(nutritionalNeeds) {
        return [
            {
                time: '08:00',
                meal: 'Breakfast',
                items: [
                    { name: 'Timothy Hay', amount: nutritionalNeeds.hay * 0.4, unit: 'kg' },
                    { name: 'Carrots', amount: nutritionalNeeds.vegetables * 0.3, unit: 'kg' },
                    { name: 'Apples', amount: nutritionalNeeds.fruits * 0.2, unit: 'kg' }
                ]
            },
            {
                time: '14:00',
                meal: 'Lunch',
                items: [
                    { name: 'Alfalfa Hay', amount: nutritionalNeeds.hay * 0.3, unit: 'kg' },
                    { name: 'Sweet Potatoes', amount: nutritionalNeeds.vegetables * 0.4, unit: 'kg' },
                    { name: 'Bananas', amount: nutritionalNeeds.fruits * 0.3, unit: 'kg' },
                    { name: 'Mineral Supplements', amount: nutritionalNeeds.supplements * 0.5, unit: 'g' }
                ]
            },
            {
                time: '18:00',
                meal: 'Dinner',
                items: [
                    { name: 'Grass Hay', amount: nutritionalNeeds.hay * 0.3, unit: 'kg' },
                    { name: 'Leafy Greens', amount: nutritionalNeeds.vegetables * 0.3, unit: 'kg' },
                    { name: 'Berries', amount: nutritionalNeeds.fruits * 0.5, unit: 'kg' },
                    { name: 'Vitamin Supplements', amount: nutritionalNeeds.supplements * 0.5, unit: 'g' }
                ]
            }
        ];
    }

    /**
     * Generate weekly meal variations
     * @param {Object} nutritionalNeeds - Nutritional requirements
     * @returns {Object} Weekly variations
     */
    generateWeeklyVariations(nutritionalNeeds) {
        return {
            monday: { theme: 'Mediterranean', specialItem: 'Olive leaves' },
            tuesday: { theme: 'Asian', specialItem: 'Bamboo shoots' },
            wednesday: { theme: 'Tropical', specialItem: 'Coconut' },
            thursday: { theme: 'Forest', specialItem: 'Tree bark' },
            friday: { theme: 'Garden', specialItem: 'Fresh herbs' },
            saturday: { theme: 'Savanna', specialItem: 'Acacia leaves' },
            sunday: { theme: 'Enrichment', specialItem: 'Puzzle feeders' }
        };
    }

    /**
     * Identify special dietary requirements
     * @param {Object} elephantData - Elephant information
     * @returns {Array} Special requirements
     */
    identifySpecialRequirements(elephantData) {
        const requirements = [];
        
        if (elephantData.health.conditions) {
            elephantData.health.conditions.forEach(condition => {
                switch (condition) {
                    case 'diabetes':
                        requirements.push('Low sugar diet');
                        break;
                    case 'arthritis':
                        requirements.push('Anti-inflammatory supplements');
                        break;
                    case 'digestive_issues':
                        requirements.push('High fiber diet');
                        break;
                    case 'allergies':
                        requirements.push('Allergen-free foods');
                        break;
                }
            });
        }
        
        if (elephantData.pregnancy) {
            requirements.push('Prenatal nutrition supplements');
        }
        
        return requirements;
    }

    /**
     * Calculate water requirements
     * @param {number} weight - Elephant weight in kg
     * @returns {Object} Water requirements
     */
    calculateWaterRequirements(weight) {
        const dailyWater = weight * 0.1; // 10% of body weight
        return {
            daily: dailyWater,
            morning: dailyWater * 0.3,
            afternoon: dailyWater * 0.4,
            evening: dailyWater * 0.3,
            unit: 'liters'
        };
    }

    /**
     * Determine necessary supplements
     * @param {Object} health - Health status
     * @returns {Array} Supplements
     */
    determineSupplements(health) {
        const supplements = ['Multivitamin', 'Calcium', 'Vitamin D'];
        
        if (health.conditions) {
            health.conditions.forEach(condition => {
                switch (condition) {
                    case 'arthritis':
                        supplements.push('Glucosamine', 'Chondroitin');
                        break;
                    case 'digestive_issues':
                        supplements.push('Probiotics');
                        break;
                    case 'immune_weakness':
                        supplements.push('Vitamin C', 'Echinacea');
                        break;
                }
            });
        }
        
        return supplements;
    }

    /**
     * Calculate staff required for feeding
     * @param {number} elephantCount - Number of elephants
     * @returns {number} Staff count
     */
    calculateStaffRequired(elephantCount) {
        return Math.ceil(elephantCount / 2) + 1; // 1 staff per 2 elephants + supervisor
    }

    /**
     * Calculate elephant age from birth date
     * @param {Date} birthDate - Birth date
     * @returns {number} Age in years
     */
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        return Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
    }

    /**
     * Save feeding plan to database
     * @param {string} elephantId - Elephant ID
     * @param {Object} feedingPlan - Feeding plan
     * @returns {Promise<void>}
     */
    async saveFeedingPlan(elephantId, feedingPlan) {
        this.feedingSchedules.set(elephantId, feedingPlan);
        // In a real implementation, this would save to database
    }

    /**
     * Get feeding history for an elephant
     * @param {string} elephantId - Elephant ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array>} Feeding history
     */
    async getFeedingHistory(elephantId, startDate, endDate) {
        try {
            const feedings = await Feeding.find({
                animalIds: elephantId,
                scheduledTime: { $gte: startDate, $lte: endDate }
            }).sort({ scheduledTime: -1 });
            
            return feedings;
        } catch (error) {
            logger.error('Failed to get feeding history:', error);
            throw error;
        }
    }

    /**
     * Update feeding plan based on health changes
     * @param {string} elephantId - Elephant ID
     * @param {Object} healthUpdate - Health update
     * @returns {Promise<Object>} Updated plan
     */
    async updateFeedingPlan(elephantId, healthUpdate) {
        try {
            const currentPlan = this.feedingSchedules.get(elephantId);
            if (!currentPlan) {
                throw new Error('No feeding plan found for elephant');
            }

            // Recalculate nutritional needs
            const newNeeds = this.calculateNutritionalNeeds(
                this.calculateAge(healthUpdate.birthDate), 
                healthUpdate
            );
            
            // Update the plan
            currentPlan.dailyMeals = this.generateDailyMeals(newNeeds);
            currentPlan.specialRequirements = this.identifySpecialRequirements(healthUpdate);
            currentPlan.supplements = this.determineSupplements(healthUpdate);
            
            await this.saveFeedingPlan(elephantId, currentPlan);
            logger.info(`Updated feeding plan for elephant ${elephantId}`);
            return currentPlan;
        } catch (error) {
            logger.error('Failed to update feeding plan:', error);
            throw error;
        }
    }
}

module.exports = ElephantFeedingManager;
