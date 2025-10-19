/**
 * Shark-tank Care Management System
 * Specialized care routines and health monitoring for shark-tank
 */

const { HealthRecord } = require('../models/HealthRecord');
const { Animal } = require('../models/Animal');
const logger = require('../utils/logger');

class Shark-tankCareManager {
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
            
            logger.info(`Completed health assessment for animal ${animalId}`);
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
            exhibitId: 'shark-tank-001',
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

module.exports = Shark-tankCareManager;
