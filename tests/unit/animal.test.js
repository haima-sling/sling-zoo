const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Animal = require('../../src/models/Animal');
const Exhibit = require('../../src/models/Exhibit');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('Animal API', () => {
  let authToken;
  let testUser;
  let testExhibit;
  let testAnimal;

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
    
    // Create test exhibit
    testExhibit = new Exhibit({
      name: 'Test Exhibit',
      type: 'indoor',
      theme: 'tropical_rainforest',
      description: 'A test exhibit for unit testing',
      capacity: {
        visitors: 100,
        animals: 10
      },
      size: {
        length: 50,
        width: 30,
        height: 10,
        area: 1500,
        unit: 'square_meters'
      },
      operatingHours: {
        open: '09:00',
        close: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      admissionFee: {
        adult: 25,
        child: 15,
        senior: 20,
        group: 20
      }
    });
    await testExhibit.save();
  });

  afterAll(async () => {
    // Clean up test data
    await Animal.deleteMany({});
    await Exhibit.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test animal before each test
    testAnimal = new Animal({
      name: 'Test Lion',
      species: 'Panthera leo',
      scientificName: 'Panthera leo',
      gender: 'male',
      birthDate: new Date('2020-01-01'),
      arrivalDate: new Date('2020-06-01'),
      origin: 'captive_bred',
      exhibitId: testExhibit._id,
      status: 'active',
      physicalDescription: {
        weight: 200,
        height: 120,
        length: 200,
        color: 'golden',
        markings: 'none',
        distinguishingFeatures: 'Large mane'
      },
      temperament: 'docile',
      diet: {
        primary: 'meat',
        secondary: ['bones', 'organs'],
        restrictions: ['processed_food'],
        feedingFrequency: 'daily',
        specialRequirements: 'Fresh meat only'
      },
      isEndangered: true,
      conservationStatus: 'vulnerable'
    });
    await testAnimal.save();
  });

  afterEach(async () => {
    // Clean up test animal after each test
    await Animal.deleteMany({});
  });

  describe('GET /api/animals', () => {
    it('should get all animals', async () => {
      const response = await request(app)
        .get('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Test Lion');
    });

    it('should filter animals by species', async () => {
      const response = await request(app)
        .get('/api/animals?species=lion')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter animals by gender', async () => {
      const response = await request(app)
        .get('/api/animals?gender=male')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter animals by status', async () => {
      const response = await request(app)
        .get('/api/animals?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter endangered animals', async () => {
      const response = await request(app)
        .get('/api/animals?isEndangered=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/animals')
        .expect(401);
    });
  });

  describe('GET /api/animals/:id', () => {
    it('should get animal by ID', async () => {
      const response = await request(app)
        .get(`/api/animals/${testAnimal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Lion');
      expect(response.body.data.species).toBe('Panthera leo');
    });

    it('should return 404 for non-existent animal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/animals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/animals/${testAnimal._id}`)
        .expect(401);
    });
  });

  describe('POST /api/animals', () => {
    it('should create a new animal', async () => {
      const newAnimal = {
        name: 'Test Tiger',
        species: 'Panthera tigris',
        scientificName: 'Panthera tigris',
        gender: 'female',
        birthDate: '2021-01-01',
        arrivalDate: '2021-06-01',
        origin: 'captive_bred',
        exhibitId: testExhibit._id,
        physicalDescription: {
          weight: 150,
          height: 100,
          length: 180,
          color: 'orange',
          markings: 'black stripes',
          distinguishingFeatures: 'Distinctive stripes'
        },
        temperament: 'shy',
        diet: {
          primary: 'meat',
          secondary: ['bones'],
          restrictions: ['processed_food'],
          feedingFrequency: 'daily',
          specialRequirements: 'Fresh meat only'
        },
        isEndangered: true,
        conservationStatus: 'endangered'
      };

      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newAnimal)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Tiger');
      expect(response.body.data.species).toBe('Panthera tigris');
    });

    it('should validate required fields', async () => {
      const invalidAnimal = {
        name: 'Test Animal',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAnimal)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/animals')
        .send({})
        .expect(401);
    });
  });

  describe('PUT /api/animals/:id', () => {
    it('should update an animal', async () => {
      const updateData = {
        name: 'Updated Lion',
        weight: 220
      };

      const response = await request(app)
        .put(`/api/animals/${testAnimal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Lion');
    });

    it('should return 404 for non-existent animal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/animals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/animals/${testAnimal._id}`)
        .send({ name: 'Updated' })
        .expect(401);
    });
  });

  describe('DELETE /api/animals/:id', () => {
    it('should delete an animal', async () => {
      const response = await request(app)
        .delete(`/api/animals/${testAnimal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Animal deleted successfully');
    });

    it('should return 404 for non-existent animal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/animals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/animals/${testAnimal._id}`)
        .expect(401);
    });
  });

  describe('POST /api/animals/:id/medical', () => {
    it('should add medical record to animal', async () => {
      const medicalRecord = {
        date: new Date(),
        veterinarian: 'Dr. Smith',
        diagnosis: 'Routine checkup',
        treatment: 'Vaccination',
        medication: [{
          name: 'Vaccine',
          dosage: '1ml',
          frequency: 'once',
          duration: '1 day'
        }],
        notes: 'Animal is healthy',
        cost: 150
      };

      const response = await request(app)
        .post(`/api/animals/${testAnimal._id}/medical`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(medicalRecord)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.veterinarian).toBe('Dr. Smith');
    });

    it('should validate medical record fields', async () => {
      const invalidRecord = {
        // Missing required fields
      };

      const response = await request(app)
        .post(`/api/animals/${testAnimal._id}/medical`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRecord)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/animals/:id/feeding', () => {
    it('should add feeding record to animal', async () => {
      const feedingRecord = {
        time: '09:00',
        foodType: 'meat',
        quantity: '2kg',
        specialInstructions: 'Fresh meat only',
        completedBy: 'John Doe'
      };

      const response = await request(app)
        .post(`/api/animals/${testAnimal._id}/feeding`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(feedingRecord)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.foodType).toBe('meat');
    });
  });

  describe('GET /api/animals/stats', () => {
    it('should get animal statistics', async () => {
      const response = await request(app)
        .get('/api/animals/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAnimals).toBe(1);
      expect(response.body.data.endangeredCount).toBe(1);
    });
  });

  describe('GET /api/animals/search', () => {
    it('should search animals by name', async () => {
      const response = await request(app)
        .get('/api/animals/search?q=lion')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should search animals by species', async () => {
      const response = await request(app)
        .get('/api/animals/search?q=panthera')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should require search query', async () => {
      await request(app)
        .get('/api/animals/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
