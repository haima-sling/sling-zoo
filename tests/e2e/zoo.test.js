const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Animal = require('../../src/models/Animal');
const Visitor = require('../../src/models/Visitor');
const Exhibit = require('../../src/models/Exhibit');
const Ticket = require('../../src/models/Ticket');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Zoo Management System E2E Tests', () => {
  let authToken;
  let testUser;
  let testExhibit;
  let testAnimal;
  let testVisitor;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/zoo_test');
    
    // Clean database
    await User.deleteMany({});
    await Animal.deleteMany({});
    await Visitor.deleteMany({});
    await Exhibit.deleteMany({});
    await Ticket.deleteMany({});
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = new User({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true
    });
    await testUser.save();
    
    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Animal.deleteMany({});
    await Visitor.deleteMany({});
    await Exhibit.deleteMany({});
    await Ticket.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Complete Zoo Operations Flow', () => {
    it('should complete full zoo setup and operations', async () => {
      // Step 1: Create an exhibit
      const exhibitData = {
        name: 'African Savanna',
        type: 'outdoor',
        theme: 'african_savanna',
        description: 'Large outdoor exhibit for African wildlife',
        capacity: { visitors: 150, animals: 12 },
        size: { length: 100, width: 80, height: 15, area: 8000 },
        operatingHours: {
          open: '09:00',
          close: '17:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        admissionFee: { adult: 25, child: 15, senior: 20, group: 20 }
      };

      const exhibitResponse = await request(app)
        .post('/api/exhibits')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exhibitData)
        .expect(201);

      testExhibit = exhibitResponse.body.data;
      expect(testExhibit.name).toBe('African Savanna');

      // Step 2: Add animals to the exhibit
      const animalData = {
        name: 'Simba',
        species: 'Panthera leo',
        scientificName: 'Panthera leo',
        gender: 'male',
        birthDate: new Date('2018-03-15'),
        arrivalDate: new Date('2018-06-01'),
        origin: 'captive_bred',
        exhibitId: testExhibit._id,
        physicalDescription: {
          weight: 220,
          height: 120,
          length: 200,
          color: 'golden'
        },
        temperament: 'docile',
        diet: {
          primary: 'meat',
          secondary: ['bones'],
          restrictions: ['processed_food'],
          feedingFrequency: 'daily'
        },
        isEndangered: true,
        conservationStatus: 'vulnerable'
      };

      const animalResponse = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(animalData)
        .expect(201);

      testAnimal = animalResponse.body.data;
      expect(testAnimal.name).toBe('Simba');

      // Step 3: Register a visitor
      const visitorData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male'
      };

      const visitorResponse = await request(app)
        .post('/api/visitors')
        .send(visitorData)
        .expect(201);

      testVisitor = visitorResponse.body.data;
      expect(testVisitor.email).toBe('john.doe@example.com');

      // Step 4: Purchase a ticket
      const ticketData = {
        visitorId: testVisitor._id,
        type: 'adult',
        price: 25,
        visitDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        paymentMethod: 'credit_card',
        transactionId: 'TXN123456789'
      };

      const ticketResponse = await request(app)
        .post('/api/tickets')
        .send(ticketData)
        .expect(201);

      expect(ticketResponse.body.data.ticketId).toBeDefined();
      expect(ticketResponse.body.data.price).toBe(25);

      // Step 5: Create feeding schedule
      const feedingData = {
        animalId: testAnimal._id,
        foodType: 'meat',
        quantity: '5kg',
        scheduledTime: '09:00'
      };

      const feedingResponse = await request(app)
        .post('/api/feedings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(feedingData)
        .expect(201);

      expect(feedingResponse.body.success).toBe(true);

      // Step 6: Add health record
      const healthData = {
        animalId: testAnimal._id,
        date: new Date(),
        veterinarian: 'Dr. Smith',
        type: 'checkup',
        diagnosis: 'Routine checkup',
        treatment: 'Vaccination',
        medication: [{
          name: 'Rabies Vaccine',
          dosage: '1ml',
          frequency: 'annually',
          duration: '1 year'
        }],
        cost: 150
      };

      const healthResponse = await request(app)
        .post('/api/health-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(healthData)
        .expect(201);

      expect(healthResponse.body.success).toBe(true);

      // Step 7: Generate report
      const reportData = {
        type: 'health',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      };

      const reportResponse = await request(app)
        .post('/api/reports/animal-health')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(reportResponse.body.success).toBe(true);
      expect(reportResponse.body.data.type).toBe('health');

      // Step 8: Verify all data is accessible
      const animalsResponse = await request(app)
        .get('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(animalsResponse.body.data.length).toBeGreaterThan(0);

      const exhibitsResponse = await request(app)
        .get('/api/exhibits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(exhibitsResponse.body.data.length).toBeGreaterThan(0);

      const visitorsResponse = await request(app)
        .get('/api/visitors')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(visitorsResponse.body.data.length).toBeGreaterThan(0);

      // Step 9: Get statistics
      const animalStatsResponse = await request(app)
        .get('/api/animals/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(animalStatsResponse.body.success).toBe(true);
      expect(animalStatsResponse.body.data.totalAnimals).toBeGreaterThan(0);

      const visitorStatsResponse = await request(app)
        .get('/api/visitors/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(visitorStatsResponse.body.success).toBe(true);

      const exhibitStatsResponse = await request(app)
        .get('/api/exhibits/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(exhibitStatsResponse.body.success).toBe(true);
    });
  });

  describe('Search and Filter Operations', () => {
    it('should search and filter data across collections', async () => {
      // Search animals
      const animalSearchResponse = await request(app)
        .get('/api/animals/search?q=simba')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(animalSearchResponse.body.success).toBe(true);

      // Search visitors
      const visitorSearchResponse = await request(app)
        .get('/api/visitors/search?q=john')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(visitorSearchResponse.body.success).toBe(true);

      // Filter exhibits by type
      const exhibitFilterResponse = await request(app)
        .get('/api/exhibits?type=outdoor')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(exhibitFilterResponse.body.success).toBe(true);

      // Get pending feedings
      const pendingFeedingsResponse = await request(app)
        .get('/api/feedings/pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(pendingFeedingsResponse.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors appropriately', async () => {
      // Try to create animal with invalid exhibit
      const invalidAnimalData = {
        name: 'Invalid Animal',
        species: 'Test Species',
        gender: 'male',
        birthDate: new Date(),
        arrivalDate: new Date(),
        origin: 'wild',
        exhibitId: new mongoose.Types.ObjectId(),
        diet: { primary: 'meat', feedingFrequency: 'daily' }
      };

      await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAnimalData)
        .expect(400);

      // Try to access protected route without auth
      await request(app)
        .get('/api/animals')
        .expect(401);

      // Try to create duplicate visitor
      const duplicateVisitor = {
        firstName: 'John',
        lastName: 'Doe',
        email: testVisitor.email,
        phone: '+1234567890'
      };

      await request(app)
        .post('/api/visitors')
        .send(duplicateVisitor)
        .expect(400);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should enforce authentication and authorization rules', async () => {
      // Create non-admin user
      const staffPassword = await bcrypt.hash('password123', 10);
      const staffUser = new User({
        firstName: 'Staff',
        lastName: 'Member',
        email: 'staff@test.com',
        password: staffPassword,
        role: 'animal_care',
        isActive: true,
        isVerified: true
      });
      await staffUser.save();

      const staffToken = jwt.sign({ userId: staffUser._id }, process.env.JWT_SECRET || 'test-secret');

      // Staff should not be able to delete animals
      await request(app)
        .delete(`/api/animals/${testAnimal._id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      // Admin should be able to delete
      await request(app)
        .delete(`/api/animals/${testAnimal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
