/**
 * Elephant Health Monitoring System
 * Comprehensive health tracking and medical care for elephants
 */

const { HealthRecord } = require('../models/HealthRecord');
const { Animal } = require('../models/Animal');
const logger = require('../utils/logger');

class ElephantHealthManager {
    constructor() {
        this.healthRecords = new Map();
        this.medicalHistory = new Map();
        this.vaccinationSchedule = new Map();
        this.emergencyProtocols = new Map();
        this.healthAlerts = [];
        this.medicalSupplies = new Map();
        this.veterinaryContacts = [];
        this.healthMetrics = {
            normal: {
                temperature: { min: 36.5, max: 37.5 },
                heartRate: { min: 25, max: 35 },
                respiratoryRate: { min: 8, max: 12 },
                weight: { min: 2000, max: 6000 }
            }
        };
    }

    /**
     * Perform comprehensive health assessment
     * @param {string} elephantId - Elephant ID
     * @param {Object} assessmentData - Health assessment data
     * @returns {Promise<Object>} Assessment result
     */
    async performHealthAssessment(elephantId, assessmentData) {
        try {
            const assessment = {
                elephantId: elephantId,
                assessmentDate: new Date(),
                vitalSigns: this.recordVitalSigns(assessmentData.vitalSigns),
                physicalExam: this.performPhysicalExam(assessmentData.physicalExam),
                behavioralObservations: assessmentData.behavioralObservations,
                nutritionalStatus: this.assessNutritionalStatus(assessmentData.nutritionalStatus),
                dentalHealth: this.assessDentalHealth(assessmentData.dentalHealth),
                skinCondition: this.assessSkinCondition(assessmentData.skinCondition),
                mobilityAssessment: this.assessMobility(assessmentData.mobility),
                overallHealthScore: 0,
                recommendations: [],
                followUpRequired: false
            };

            // Calculate overall health score
            assessment.overallHealthScore = this.calculateHealthScore(assessment);
            
            // Generate recommendations
            assessment.recommendations = this.generateRecommendations(assessment);
            
            // Check if follow-up is required
            assessment.followUpRequired = this.requiresFollowUp(assessment);

            // Save assessment
            await this.saveHealthAssessment(elephantId, assessment);
            
            // Check for health alerts
            await this.checkHealthAlerts(elephantId, assessment);
            
            logger.info(`Completed health assessment for elephant ${elephantId}`);
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

        // Validate against normal ranges
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
            trunk: {
                flexibility: physicalExam.trunk.flexibility,
                strength: physicalExam.trunk.strength,
                coordination: physicalExam.trunk.coordination,
                abnormalities: physicalExam.trunk.abnormalities || []
            },
            limbs: {
                front: {
                    condition: physicalExam.limbs.front.condition,
                    mobility: physicalExam.limbs.front.mobility,
                    abnormalities: physicalExam.limbs.front.abnormalities || []
                },
                rear: {
                    condition: physicalExam.limbs.rear.condition,
                    mobility: physicalExam.limbs.rear.mobility,
                    abnormalities: physicalExam.limbs.rear.abnormalities || []
                }
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
     * Assess dental health
     * @param {Object} dentalHealth - Dental examination data
     * @returns {Object} Dental assessment
     */
    assessDentalHealth(dentalHealth) {
        return {
            teethCondition: dentalHealth.teethCondition,
            gumHealth: dentalHealth.gumHealth,
            biteAlignment: dentalHealth.biteAlignment,
            dentalWear: dentalHealth.dentalWear,
            abnormalities: dentalHealth.abnormalities || [],
            recommendations: this.generateDentalRecommendations(dentalHealth)
        };
    }

    /**
     * Assess skin condition
     * @param {Object} skinCondition - Skin examination data
     * @returns {Object} Skin assessment
     */
    assessSkinCondition(skinCondition) {
        return {
            overallCondition: skinCondition.overallCondition,
            lesions: skinCondition.lesions || [],
            parasites: skinCondition.parasites || [],
            infections: skinCondition.infections || [],
            dryness: skinCondition.dryness,
            recommendations: this.generateSkinCareRecommendations(skinCondition)
        };
    }

    /**
     * Assess mobility and movement
     * @param {Object} mobility - Mobility assessment data
     * @returns {Object} Mobility assessment
     */
    assessMobility(mobility) {
        return {
            walking: {
                gait: mobility.walking.gait,
                speed: mobility.walking.speed,
                balance: mobility.walking.balance,
                abnormalities: mobility.walking.abnormalities || []
            },
            standing: {
                posture: mobility.standing.posture,
                stability: mobility.standing.stability,
                abnormalities: mobility.standing.abnormalities || []
            },
            lying: {
                ability: mobility.lying.ability,
                comfort: mobility.lying.comfort,
                abnormalities: mobility.lying.abnormalities || []
            },
            overallMobility: mobility.overallMobility,
            recommendations: this.generateMobilityRecommendations(mobility)
        };
    }

    /**
     * Calculate overall health score
     * @param {Object} assessment - Complete health assessment
     * @returns {number} Health score (0-100)
     */
    calculateHealthScore(assessment) {
        let score = 100;
        
        // Deduct points for abnormalities
        if (assessment.vitalSigns.status === 'abnormal') score -= 20;
        if (assessment.physicalExam.abnormalities.length > 0) score -= 15;
        if (assessment.nutritionalStatus.bodyCondition !== 'excellent') score -= 10;
        if (assessment.dentalHealth.abnormalities.length > 0) score -= 10;
        if (assessment.skinCondition.lesions.length > 0) score -= 5;
        if (assessment.mobility.overallMobility !== 'excellent') score -= 10;
        
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
        
        if (assessment.dentalHealth.abnormalities.length > 0) {
            recommendations.push('Schedule dental examination');
        }
        
        if (assessment.skinCondition.lesions.length > 0) {
            recommendations.push('Treat skin lesions and monitor healing');
        }
        
        if (assessment.mobility.overallMobility !== 'excellent') {
            recommendations.push('Implement mobility exercises and physical therapy');
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
     * @param {string} elephantId - Elephant ID
     * @param {Object} assessment - Health assessment
     * @returns {Promise<void>}
     */
    async saveHealthAssessment(elephantId, assessment) {
        const healthRecord = new HealthRecord({
            animalId: elephantId,
            exhibitId: 'elephant-exhibit-001',
            assessmentType: 'comprehensive',
            ...assessment,
            recordedAt: new Date()
        });
        
        await healthRecord.save();
        this.healthRecords.set(elephantId, assessment);
    }

    /**
     * Check for health alerts
     * @param {string} elephantId - Elephant ID
     * @param {Object} assessment - Health assessment
     * @returns {Promise<void>}
     */
    async checkHealthAlerts(elephantId, assessment) {
        if (assessment.overallHealthScore < 70) {
            this.healthAlerts.push({
                elephantId: elephantId,
                alertType: 'critical',
                message: 'Critical health condition detected',
                assessmentDate: assessment.assessmentDate,
                score: assessment.overallHealthScore
            });
        } else if (assessment.overallHealthScore < 80) {
            this.healthAlerts.push({
                elephantId: elephantId,
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
     * Generate dental recommendations
     * @param {Object} dentalHealth - Dental health data
     * @returns {Array} Recommendations
     */
    generateDentalRecommendations(dentalHealth) {
        const recommendations = [];
        
        if (dentalHealth.teethCondition !== 'excellent') {
            recommendations.push('Schedule professional dental cleaning');
        }
        
        if (dentalHealth.gumHealth !== 'healthy') {
            recommendations.push('Implement gum care routine');
        }
        
        return recommendations;
    }

    /**
     * Generate skin care recommendations
     * @param {Object} skinCondition - Skin condition data
     * @returns {Array} Recommendations
     */
    generateSkinCareRecommendations(skinCondition) {
        const recommendations = [];
        
        if (skinCondition.lesions.length > 0) {
            recommendations.push('Treat lesions with appropriate medication');
        }
        
        if (skinCondition.dryness === 'severe') {
            recommendations.push('Implement moisturizing routine');
        }
        
        return recommendations;
    }

    /**
     * Generate mobility recommendations
     * @param {Object} mobility - Mobility assessment data
     * @returns {Array} Recommendations
     */
    generateMobilityRecommendations(mobility) {
        const recommendations = [];
        
        if (mobility.overallMobility !== 'excellent') {
            recommendations.push('Implement physical therapy program');
        }
        
        if (mobility.walking.abnormalities.length > 0) {
            recommendations.push('Address gait abnormalities');
        }
        
        return recommendations;
    }
}

module.exports = ElephantHealthManager;
