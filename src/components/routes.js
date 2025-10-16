const express = require('express');
const router = express.Router();

// Import middleware
const auth = require('../middleware/auth');
const { validators, handleValidationErrors } = require('../utils/validation');

// Import controllers
const authController = require('../controllers/authController');
const animalController = require('../controllers/animalController');
const visitorController = require('../controllers/visitorController');
const staffController = require('../controllers/staffController');
const exhibitController = require('../controllers/exhibitController');
const feedingController = require('../controllers/feedingController');
const healthController = require('../controllers/healthController');
const ticketController = require('../controllers/ticketController');
const reportController = require('../controllers/reportController');

// Authentication routes
router.post('/auth/register', validators.register, handleValidationErrors, authController.register);
router.post('/auth/login', validators.login, handleValidationErrors, authController.login);
router.get('/auth/profile', auth.authenticateToken, authController.getProfile);
router.put('/auth/profile', auth.authenticateToken, authController.updateProfile);
router.post('/auth/change-password', auth.authenticateToken, authController.changePassword);
router.post('/auth/request-password-reset', authController.requestPasswordReset);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/logout', auth.authenticateToken, authController.logout);
router.post('/auth/verify-email', authController.verifyEmail);

// Animal routes
router.get('/animals', auth.authenticateToken, validators.pagination, handleValidationErrors, animalController.getAllAnimals);
router.get('/animals/stats', auth.authenticateToken, animalController.getAnimalStats);
router.get('/animals/search', auth.authenticateToken, validators.search, handleValidationErrors, animalController.searchAnimals);
router.get('/animals/:id', auth.authenticateToken, animalController.getAnimalById);
router.post('/animals', auth.authenticateToken, auth.authorize('admin', 'veterinarian', 'animal_care'), validators.createAnimal, handleValidationErrors, animalController.createAnimal);
router.put('/animals/:id', auth.authenticateToken, auth.authorize('admin', 'veterinarian', 'animal_care'), animalController.updateAnimal);
router.delete('/animals/:id', auth.authenticateToken, auth.authorize('admin'), animalController.deleteAnimal);
router.post('/animals/:id/medical', auth.authenticateToken, auth.authorize('admin', 'veterinarian'), animalController.addMedicalRecord);
router.post('/animals/:id/feeding', auth.authenticateToken, auth.authorize('admin', 'veterinarian', 'animal_care'), animalController.addFeedingRecord);

// Visitor routes
router.get('/visitors', auth.authenticateToken, validators.pagination, handleValidationErrors, visitorController.getAllVisitors);
router.get('/visitors/stats', auth.authenticateToken, visitorController.getVisitorStats);
router.get('/visitors/search', auth.authenticateToken, validators.search, handleValidationErrors, visitorController.searchVisitors);
router.get('/visitors/email/:email', auth.authenticateToken, visitorController.getVisitorByEmail);
router.get('/visitors/:id', auth.authenticateToken, visitorController.getVisitorById);
router.post('/visitors', validators.createVisitor, handleValidationErrors, visitorController.createVisitor);
router.put('/visitors/:id', auth.authenticateToken, visitorController.updateVisitor);
router.delete('/visitors/:id', auth.authenticateToken, auth.authorize('admin'), visitorController.deleteVisitor);
router.post('/visitors/:id/tickets', validators.createTicket, handleValidationErrors, visitorController.purchaseTicket);
router.post('/visitors/:id/visits', auth.authenticateToken, visitorController.recordVisit);
router.post('/visitors/:id/loyalty-points', auth.authenticateToken, visitorController.addLoyaltyPoints);

// Staff routes
router.get('/staff', auth.authenticateToken, validators.pagination, handleValidationErrors, staffController.getAllStaff);
router.get('/staff/stats', auth.authenticateToken, staffController.getStaffStats);
router.get('/staff/search', auth.authenticateToken, validators.search, handleValidationErrors, staffController.searchStaff);
router.get('/staff/role/:role', auth.authenticateToken, staffController.getStaffByRole);
router.get('/staff/department/:department', auth.authenticateToken, staffController.getStaffByDepartment);
router.get('/staff/:id', auth.authenticateToken, staffController.getStaffById);
router.post('/staff', auth.authenticateToken, auth.authorize('admin', 'manager'), validators.createStaff, handleValidationErrors, staffController.createStaff);
router.put('/staff/:id', auth.authenticateToken, auth.authorize('admin', 'manager'), staffController.updateStaff);
router.delete('/staff/:id', auth.authenticateToken, auth.authorize('admin'), staffController.deleteStaff);
router.post('/staff/:id/training', auth.authenticateToken, auth.authorize('admin', 'manager'), staffController.addTrainingRecord);
router.post('/staff/:id/review', auth.authenticateToken, auth.authorize('admin', 'manager'), staffController.addPerformanceReview);

// Exhibit routes
router.get('/exhibits', auth.authenticateToken, validators.pagination, handleValidationErrors, exhibitController.getAllExhibits);
router.get('/exhibits/stats', auth.authenticateToken, exhibitController.getExhibitStats);
router.get('/exhibits/search', auth.authenticateToken, validators.search, handleValidationErrors, exhibitController.searchExhibits);
router.get('/exhibits/type/:type', auth.authenticateToken, exhibitController.getExhibitsByType);
router.get('/exhibits/theme/:theme', auth.authenticateToken, exhibitController.getExhibitsByTheme);
router.get('/exhibits/:id', auth.authenticateToken, exhibitController.getExhibitById);
router.post('/exhibits', auth.authenticateToken, auth.authorize('admin', 'manager'), validators.createExhibit, handleValidationErrors, exhibitController.createExhibit);
router.put('/exhibits/:id', auth.authenticateToken, auth.authorize('admin', 'manager'), exhibitController.updateExhibit);
router.delete('/exhibits/:id', auth.authenticateToken, auth.authorize('admin'), exhibitController.deleteExhibit);
router.post('/exhibits/:id/maintenance', auth.authenticateToken, auth.authorize('admin', 'manager', 'maintenance'), exhibitController.addMaintenanceRecord);
router.put('/exhibits/:id/environmental', auth.authenticateToken, auth.authorize('admin', 'manager', 'maintenance'), exhibitController.updateEnvironmentalControls);
router.post('/exhibits/:id/staff', auth.authenticateToken, auth.authorize('admin', 'manager'), exhibitController.assignStaff);
router.delete('/exhibits/:id/staff/:staffId', auth.authenticateToken, auth.authorize('admin', 'manager'), exhibitController.removeStaff);

// Feeding routes
router.get('/feedings', auth.authenticateToken, validators.pagination, handleValidationErrors, feedingController.getAllFeedings);
router.get('/feedings/pending', auth.authenticateToken, feedingController.getPendingFeedings);
router.get('/feedings/today', auth.authenticateToken, feedingController.getTodayFeedings);
router.get('/feedings/stats', auth.authenticateToken, feedingController.getFeedingStats);
router.get('/feedings/animal/:animalId', auth.authenticateToken, feedingController.getFeedingsByAnimal);
router.get('/feedings/exhibit/:exhibitId', auth.authenticateToken, feedingController.getFeedingsByExhibit);
router.get('/feedings/:id', auth.authenticateToken, feedingController.getFeedingById);
router.post('/feedings', auth.authenticateToken, auth.authorize('admin', 'veterinarian', 'animal_care'), validators.createFeeding, handleValidationErrors, feedingController.createFeeding);
router.put('/feedings/:id', auth.authenticateToken, auth.authorize('admin', 'veterinarian', 'animal_care'), feedingController.updateFeeding);
router.delete('/feedings/:id', auth.authenticateToken, auth.authorize('admin'), feedingController.deleteFeeding);
router.post('/feedings/:id/complete', auth.authenticateToken, auth.authorize('admin', 'veterinarian', 'animal_care'), feedingController.markFeedingCompleted);

// Health record routes
router.get('/health-records', auth.authenticateToken, validators.pagination, handleValidationErrors, healthController.getAllHealthRecords);
router.get('/health-records/stats', auth.authenticateToken, healthController.getHealthStats);
router.get('/health-records/search', auth.authenticateToken, validators.search, handleValidationErrors, healthController.searchHealthRecords);
router.get('/health-records/due', auth.authenticateToken, healthController.getAnimalsDueForHealthCheck);
router.get('/health-records/animal/:animalId', auth.authenticateToken, healthController.getHealthRecordsByAnimal);
router.get('/health-records/veterinarian/:veterinarian', auth.authenticateToken, healthController.getHealthRecordsByVeterinarian);
router.get('/health-records/:id', auth.authenticateToken, healthController.getHealthRecordById);
router.post('/health-records', auth.authenticateToken, auth.authorize('admin', 'veterinarian'), validators.createHealthRecord, handleValidationErrors, healthController.createHealthRecord);
router.put('/health-records/:id', auth.authenticateToken, auth.authorize('admin', 'veterinarian'), healthController.updateHealthRecord);
router.delete('/health-records/:id', auth.authenticateToken, auth.authorize('admin'), healthController.deleteHealthRecord);

// Ticket routes
router.get('/tickets', auth.authenticateToken, validators.pagination, handleValidationErrors, ticketController.getAllTickets);
router.get('/tickets/stats', auth.authenticateToken, ticketController.getTicketStats);
router.get('/tickets/today', auth.authenticateToken, ticketController.getTodayTickets);
router.get('/tickets/search', auth.authenticateToken, validators.search, handleValidationErrors, ticketController.searchTickets);
router.get('/tickets/visitor/:visitorId', auth.authenticateToken, ticketController.getTicketsByVisitor);
router.get('/tickets/ticket-id/:ticketId', ticketController.getTicketByTicketId);
router.get('/tickets/:id', auth.authenticateToken, ticketController.getTicketById);
router.post('/tickets', validators.createTicket, handleValidationErrors, ticketController.createTicket);
router.put('/tickets/:id', auth.authenticateToken, ticketController.updateTicket);
router.delete('/tickets/:id', auth.authenticateToken, auth.authorize('admin'), ticketController.deleteTicket);
router.post('/tickets/validate/:ticketId', ticketController.validateTicket);

// Report routes
router.get('/reports', auth.authenticateToken, validators.pagination, handleValidationErrors, reportController.getAllReports);
router.get('/reports/type/:type', auth.authenticateToken, reportController.getReportsByType);
router.get('/reports/:id', auth.authenticateToken, reportController.getReportById);
router.post('/reports/animal-health', auth.authenticateToken, auth.authorize('admin', 'manager', 'veterinarian'), validators.generateReport, handleValidationErrors, reportController.generateAnimalHealthReport);
router.post('/reports/visitor-analytics', auth.authenticateToken, auth.authorize('admin', 'manager'), validators.generateReport, handleValidationErrors, reportController.generateVisitorAnalyticsReport);
router.post('/reports/financial', auth.authenticateToken, auth.authorize('admin', 'manager'), validators.generateReport, handleValidationErrors, reportController.generateFinancialReport);
router.post('/reports/exhibit-occupancy', auth.authenticateToken, auth.authorize('admin', 'manager'), validators.generateReport, handleValidationErrors, reportController.generateExhibitOccupancyReport);
router.delete('/reports/:id', auth.authenticateToken, auth.authorize('admin'), reportController.deleteReport);

module.exports = router;
