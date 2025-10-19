const Animal = require('../models/Animal');
const Visitor = require('../models/Visitor');
const Ticket = require('../models/Ticket');
const Exhibit = require('../models/Exhibit');
const Staff = require('../models/Staff');
const logger = require('../utils/logger');
const moment = require('moment');

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache helper methods
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Get dashboard overview
  async getDashboardOverview() {
    try {
      const cacheKey = 'dashboard_overview';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const [
        totalAnimals,
        totalVisitors,
        totalTickets,
        totalExhibits,
        totalStaff,
        todayRevenue,
        todayVisitors,
        endangeredAnimals,
        openExhibits
      ] = await Promise.all([
        Animal.countDocuments(),
        Visitor.countDocuments(),
        Ticket.countDocuments(),
        Exhibit.countDocuments(),
        Staff.countDocuments({ isActive: true }),
        this.getTodayRevenue(),
        this.getTodayVisitors(),
        Animal.countDocuments({ isEndangered: true }),
        Exhibit.countDocuments({ status: 'open' })
      ]);

      const overview = {
        totalAnimals,
        totalVisitors,
        totalTickets,
        totalExhibits,
        totalStaff,
        todayRevenue,
        todayVisitors,
        endangeredAnimals,
        openExhibits
      };

      this.setCachedData(cacheKey, overview);
      return overview;
    } catch (error) {
      logger.error('Error getting dashboard overview:', error);
      throw error;
    }
  }

  // Get today's revenue
  async getTodayRevenue() {
    try {
      const today = moment().startOf('day').toDate();
      const tomorrow = moment().add(1, 'day').startOf('day').toDate();

      const result = await Ticket.aggregate([
        {
          $match: {
            purchaseDate: { $gte: today, $lt: tomorrow }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$price' }
          }
        }
      ]);

      return result[0]?.total || 0;
    } catch (error) {
      logger.error('Error getting today revenue:', error);
      throw error;
    }
  }

  // Get today's visitors
  async getTodayVisitors() {
    try {
      const today = moment().startOf('day').toDate();
      const tomorrow = moment().add(1, 'day').startOf('day').toDate();

      return await Ticket.countDocuments({
        visitDate: { $gte: today, $lt: tomorrow }
      });
    } catch (error) {
      logger.error('Error getting today visitors:', error);
      throw error;
    }
  }

  // Get revenue trends
  async getRevenueTrends(days = 30) {
    try {
      const cacheKey = `revenue_trends_${days}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const startDate = moment().subtract(days, 'days').startOf('day').toDate();

      const trends = await Ticket.aggregate([
        {
          $match: {
            purchaseDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' }
            },
            revenue: { $sum: '$price' },
            tickets: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      this.setCachedData(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('Error getting revenue trends:', error);
      throw error;
    }
  }

  // Get visitor trends
  async getVisitorTrends(days = 30) {
    try {
      const cacheKey = `visitor_trends_${days}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const startDate = moment().subtract(days, 'days').startOf('day').toDate();

      const trends = await Visitor.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      this.setCachedData(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('Error getting visitor trends:', error);
      throw error;
    }
  }

  // Get ticket type distribution
  async getTicketTypeDistribution() {
    try {
      const cacheKey = 'ticket_type_distribution';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const distribution = await Ticket.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            revenue: { $sum: '$price' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      this.setCachedData(cacheKey, distribution);
      return distribution;
    } catch (error) {
      logger.error('Error getting ticket type distribution:', error);
      throw error;
    }
  }

  // Get animal species distribution
  async getAnimalSpeciesDistribution() {
    try {
      const cacheKey = 'animal_species_distribution';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const distribution = await Animal.aggregate([
        {
          $group: {
            _id: '$species',
            count: { $sum: 1 },
            endangered: { $sum: { $cond: ['$isEndangered', 1, 0] } }
          }
        },
        { $sort: { count: -1 } }
      ]);

      this.setCachedData(cacheKey, distribution);
      return distribution;
    } catch (error) {
      logger.error('Error getting animal species distribution:', error);
      throw error;
    }
  }

  // Get exhibit occupancy rates
  async getExhibitOccupancyRates() {
    try {
      const cacheKey = 'exhibit_occupancy_rates';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const exhibits = await Exhibit.find().select('name capacity currentOccupancy');

      const occupancyRates = exhibits.map(exhibit => ({
        name: exhibit.name,
        capacity: exhibit.capacity.animals,
        occupied: exhibit.currentOccupancy.animals,
        occupancyRate: ((exhibit.currentOccupancy.animals / exhibit.capacity.animals) * 100).toFixed(2)
      }));

      this.setCachedData(cacheKey, occupancyRates);
      return occupancyRates;
    } catch (error) {
      logger.error('Error getting exhibit occupancy rates:', error);
      throw error;
    }
  }

  // Get staff performance metrics
  async getStaffPerformanceMetrics() {
    try {
      const cacheKey = 'staff_performance_metrics';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const metrics = await Staff.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            averageSalary: { $avg: '$salary' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      logger.error('Error getting staff performance metrics:', error);
      throw error;
    }
  }

  // Get visitor demographics
  async getVisitorDemographics() {
    try {
      const cacheKey = 'visitor_demographics';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const [genderDistribution, ageDistribution, sourceDistribution] = await Promise.all([
        this.getGenderDistribution(),
        this.getAgeDistribution(),
        this.getSourceDistribution()
      ]);

      const demographics = {
        gender: genderDistribution,
        age: ageDistribution,
        source: sourceDistribution
      };

      this.setCachedData(cacheKey, demographics);
      return demographics;
    } catch (error) {
      logger.error('Error getting visitor demographics:', error);
      throw error;
    }
  }

  // Get gender distribution
  async getGenderDistribution() {
    try {
      return await Visitor.aggregate([
        {
          $group: {
            _id: '$gender',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
    } catch (error) {
      logger.error('Error getting gender distribution:', error);
      throw error;
    }
  }

  // Get age distribution
  async getAgeDistribution() {
    try {
      const visitors = await Visitor.find({ dateOfBirth: { $exists: true } }).select('dateOfBirth');
      
      const ageGroups = {
        '0-17': 0,
        '18-30': 0,
        '31-45': 0,
        '46-60': 0,
        '61+': 0
      };

      visitors.forEach(visitor => {
        const age = moment().diff(moment(visitor.dateOfBirth), 'years');
        if (age < 18) ageGroups['0-17']++;
        else if (age <= 30) ageGroups['18-30']++;
        else if (age <= 45) ageGroups['31-45']++;
        else if (age <= 60) ageGroups['46-60']++;
        else ageGroups['61+']++;
      });

      return Object.entries(ageGroups).map(([range, count]) => ({
        _id: range,
        count
      }));
    } catch (error) {
      logger.error('Error getting age distribution:', error);
      throw error;
    }
  }

  // Get source distribution
  async getSourceDistribution() {
    try {
      return await Visitor.aggregate([
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
    } catch (error) {
      logger.error('Error getting source distribution:', error);
      throw error;
    }
  }

  // Get peak hours
  async getPeakHours() {
    try {
      const cacheKey = 'peak_hours';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const today = moment().startOf('day').toDate();
      const tomorrow = moment().add(1, 'day').startOf('day').toDate();

      const hourlyDistribution = await Ticket.aggregate([
        {
          $match: {
            usedAt: { $gte: today, $lt: tomorrow },
            isUsed: true
          }
        },
        {
          $group: {
            _id: { $hour: '$usedAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      this.setCachedData(cacheKey, hourlyDistribution);
      return hourlyDistribution;
    } catch (error) {
      logger.error('Error getting peak hours:', error);
      throw error;
    }
  }

  // Get popular exhibits
  async getPopularExhibits() {
    try {
      const cacheKey = 'popular_exhibits';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const exhibits = await Exhibit.find()
        .select('name currentOccupancy.visitors')
        .sort({ 'currentOccupancy.visitors': -1 })
        .limit(10);

      this.setCachedData(cacheKey, exhibits);
      return exhibits;
    } catch (error) {
      logger.error('Error getting popular exhibits:', error);
      throw error;
    }
  }

  // Generate comprehensive analytics report
  async generateAnalyticsReport(startDate, endDate) {
    try {
      const [
        overview,
        revenueTrends,
        visitorTrends,
        ticketDistribution,
        animalDistribution,
        occupancyRates,
        demographics
      ] = await Promise.all([
        this.getDashboardOverview(),
        this.getRevenueTrends(30),
        this.getVisitorTrends(30),
        this.getTicketTypeDistribution(),
        this.getAnimalSpeciesDistribution(),
        this.getExhibitOccupancyRates(),
        this.getVisitorDemographics()
      ]);

      return {
        overview,
        trends: {
          revenue: revenueTrends,
          visitors: visitorTrends
        },
        distribution: {
          tickets: ticketDistribution,
          animals: animalDistribution
        },
        occupancy: occupancyRates,
        demographics,
        generatedAt: new Date(),
        period: {
          start: startDate || moment().subtract(30, 'days').toDate(),
          end: endDate || new Date()
        }
      };
    } catch (error) {
      logger.error('Error generating analytics report:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
