const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Visitor = require('../../src/models/Visitor');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('Visitor Integration Tests', () => {
  let authToken;
  let testUser;
  let testVisitor;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/zoo_test');
    
    // Create test user
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    });
    await testUser.save();
    
    // Generate auth token
    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    // Clean up test data
    await Visitor.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test visitor before each test
    testVisitor = new Visitor({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      preferences: {
        interests: ['animals', 'education'],
        language: 'en',
        communicationMethod: 'email',
        newsletterSubscription: true
      },
      source: 'website'
    });
    await testVisitor.save();
  });

  afterEach(async () => {
    // Clean up test visitor after each test
    await Visitor.deleteMany({});
  });

  describe('Visitor Registration Flow', () => {
    it('should complete full visitor registration and ticket purchase flow', async () => {
      // Step 1: Create visitor
      const visitorData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1987654321',
        dateOfBirth: '1985-05-15',
        gender: 'female',
        address: {
          street: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          zipCode: '54321',
          country: 'USA'
        },
        preferences: {
          interests: ['animals', 'photography'],
          language: 'en',
          communicationMethod: 'email',
          newsletterSubscription: true
        },
        source: 'website'
      };

      const createResponse = await request(app)
        .post('/api/visitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(visitorData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      const visitorId = createResponse.body.data._id;

      // Step 2: Purchase ticket
      const ticketData = {
        type: 'adult',
        price: 25,
        visitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        paymentMethod: 'credit_card',
        transactionId: 'TXN123456789'
      };

      const ticketResponse = await request(app)
        .post(`/api/visitors/${visitorId}/tickets`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(ticketData)
        .expect(200);

      expect(ticketResponse.body.success).toBe(true);
      expect(ticketResponse.body.data.ticketId).toBeDefined();

      // Step 3: Record visit
      const visitData = {
        entryTime: new Date(),
        exhibitsVisited: [
          {
            exhibitId: new mongoose.Types.ObjectId(),
            visitTime: new Date(),
            duration: 30
          }
        ],
        activities: [
          {
            activityId: new mongoose.Types.ObjectId(),
            participationTime: new Date(),
            rating: 5
          }
        ],
        spending: {
          food: 15,
          souvenirs: 25,
          activities: 10,
          total: 50
        },
        feedback: {
          rating: 5,
          comments: 'Great experience!',
          suggestions: 'More interactive exhibits'
        },
        groupSize: 2
      };

      const visitResponse = await request(app)
        .post(`/api/visitors/${visitorId}/visits`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(visitData)
        .expect(200);

      expect(visitResponse.body.success).toBe(true);

      // Step 4: Add loyalty points
      const loyaltyResponse = await request(app)
        .post(`/api/visitors/${visitorId}/loyalty-points`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          points: 100,
          reason: 'First visit bonus'
        })
        .expect(200);

      expect(loyaltyResponse.body.success).toBe(true);
      expect(loyaltyResponse.body.data.pointsAdded).toBe(100);

      // Step 5: Verify visitor data is updated correctly
      const updatedVisitor = await Visitor.findById(visitorId);
      expect(updatedVisitor.totalVisits).toBe(1);
      expect(updatedVisitor.totalSpent).toBe(50);
      expect(updatedVisitor.loyaltyPoints).toBe(100);
      expect(updatedVisitor.lastVisitDate).toBeDefined();
    });
  });

  describe('Visitor Search and Filtering', () => {
    beforeEach(async () => {
      // Create multiple test visitors
      const visitors = [
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice@example.com',
          isVip: true,
          vipLevel: 'gold',
          totalSpent: 5000
        },
        {
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@example.com',
          isVip: false,
          totalSpent: 100
        },
        {
          firstName: 'Carol',
          lastName: 'Brown',
          email: 'carol@example.com',
          isVip: true,
          vipLevel: 'silver',
          totalSpent: 2000
        }
      ];

      for (const visitorData of visitors) {
        const visitor = new Visitor(visitorData);
        await visitor.save();
      }
    });

    it('should filter visitors by VIP status', async () => {
      const response = await request(app)
        .get('/api/visitors?isVip=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Alice and Carol
      expect(response.body.data.every(v => v.isVip)).toBe(true);
    });

    it('should filter visitors by VIP level', async () => {
      const response = await request(app)
        .get('/api/visitors?vipLevel=gold')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].vipLevel).toBe('gold');
    });

    it('should search visitors by name', async () => {
      const response = await request(app)
        .get('/api/visitors/search?q=alice')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].firstName).toBe('Alice');
    });

    it('should search visitors by email', async () => {
      const response = await request(app)
        .get('/api/visitors/search?q=bob@example.com')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe('bob@example.com');
    });
  });

  describe('Visitor Statistics', () => {
    beforeEach(async () => {
      // Create visitors with different spending patterns
      const visitors = [
        { firstName: 'High', lastName: 'Spender', email: 'high@example.com', totalSpent: 10000, totalVisits: 20 },
        { firstName: 'Medium', lastName: 'Spender', email: 'medium@example.com', totalSpent: 2000, totalVisits: 5 },
        { firstName: 'Low', lastName: 'Spender', email: 'low@example.com', totalSpent: 100, totalVisits: 1 },
        { firstName: 'VIP', lastName: 'Member', email: 'vip@example.com', totalSpent: 5000, totalVisits: 15, isVip: true }
      ];

      for (const visitorData of visitors) {
        const visitor = new Visitor(visitorData);
        await visitor.save();
      }
    });

    it('should calculate visitor statistics correctly', async () => {
      const response = await request(app)
        .get('/api/visitors/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalVisitors).toBe(4);
      expect(response.body.data.totalRevenue).toBe(17100); // 10000 + 2000 + 100 + 5000
      expect(response.body.data.averageSpending).toBe(4275); // 17100 / 4
      expect(response.body.data.vipCount).toBe(1);
    });
  });

  describe('Visitor Membership Management', () => {
    it('should create and manage visitor membership', async () => {
      const membershipData = {
        type: 'premium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        benefits: ['unlimited_visits', 'guest_passes', 'discounts'],
        guestPasses: 4,
        discountPercentage: 20,
        autoRenewal: true
      };

      const response = await request(app)
        .put(`/api/visitors/${testVisitor._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ membership: membershipData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.membership.type).toBe('premium');
      expect(response.body.data.membership.isActive).toBe(true);
    });

    it('should validate membership dates', async () => {
      const invalidMembershipData = {
        type: 'premium',
        startDate: new Date(),
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (invalid)
        benefits: ['unlimited_visits']
      };

      const response = await request(app)
        .put(`/api/visitors/${testVisitor._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ membership: invalidMembershipData })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Visitor Data Validation', () => {
    it('should validate email format', async () => {
      const invalidVisitor = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/visitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidVisitor)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate phone number format', async () => {
      const invalidVisitor = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: 'invalid-phone'
      };

      const response = await request(app)
        .post('/api/visitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidVisitor)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should prevent duplicate email addresses', async () => {
      const duplicateVisitor = {
        firstName: 'Another',
        lastName: 'User',
        email: testVisitor.email, // Same email as existing visitor
        phone: '+1987654321'
      };

      const response = await request(app)
        .post('/api/visitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateVisitor)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Visitor with this email already exists');
    });
  });

  describe('Visitor Privacy and Data Protection', () => {
    it('should not expose sensitive data in responses', async () => {
      const response = await request(app)
        .get(`/api/visitors/${testVisitor._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('internalNotes');
    });

    it('should allow visitors to update their own data', async () => {
      // Create a visitor user account
      const visitorUser = new User({
        firstName: 'Visitor',
        lastName: 'User',
        email: 'visitor@example.com',
        password: 'password123',
        role: 'visitor',
        isActive: true
      });
      await visitorUser.save();

      const visitorAuthToken = jwt.sign({ userId: visitorUser._id }, process.env.JWT_SECRET || 'test-secret');

      const updateData = {
        phone: '+1111111111',
        preferences: {
          interests: ['animals', 'education'],
          language: 'en',
          communicationMethod: 'email',
          newsletterSubscription: false
        }
      };

      const response = await request(app)
        .put(`/api/visitors/${testVisitor._id}`)
        .set('Authorization', `Bearer ${visitorAuthToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.phone).toBe('+1111111111');
    });
  });
});
