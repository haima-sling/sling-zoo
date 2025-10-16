const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Animal = require('../src/models/Animal');
const Visitor = require('../src/models/Visitor');
const Exhibit = require('../src/models/Exhibit');
const Staff = require('../src/models/Staff');
const Feeding = require('../src/models/Feeding');
const HealthRecord = require('../src/models/HealthRecord');
const Ticket = require('../src/models/Ticket');
const Report = require('../src/models/Report');

const logger = require('../src/utils/logger');

class DatabaseSeeder {
  constructor() {
    this.connection = null;
    this.seedData = {
      users: [],
      exhibits: [],
      animals: [],
      visitors: [],
      staff: [],
      feedings: [],
      healthRecords: [],
      tickets: [],
      reports: []
    };
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zoo_management';
      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('Connected to MongoDB for seeding');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      logger.info('Disconnected from MongoDB');
    }
  }

  async clearDatabase() {
    logger.info('Clearing existing data...');
    
    try {
      await User.deleteMany({});
      await Animal.deleteMany({});
      await Visitor.deleteMany({});
      await Exhibit.deleteMany({});
      await Staff.deleteMany({});
      await Feeding.deleteMany({});
      await HealthRecord.deleteMany({});
      await Ticket.deleteMany({});
      await Report.deleteMany({});
      
      logger.info('Database cleared successfully');
    } catch (error) {
      logger.error('Failed to clear database:', error);
      throw error;
    }
  }

  async seedUsers() {
    logger.info('Seeding users...');
    
    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@zoo.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        isActive: true,
        isVerified: true,
        permissions: ['all']
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@zoo.com',
        password: await bcrypt.hash('password123', 10),
        role: 'veterinarian',
        isActive: true,
        isVerified: true,
        permissions: ['animal_health', 'medical_records', 'feeding_schedules']
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@zoo.com',
        password: await bcrypt.hash('password123', 10),
        role: 'animal_care',
        isActive: true,
        isVerified: true,
        permissions: ['animal_care', 'feeding_schedules', 'exhibit_maintenance']
      },
      {
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@zoo.com',
        password: await bcrypt.hash('password123', 10),
        role: 'maintenance',
        isActive: true,
        isVerified: true,
        permissions: ['exhibit_maintenance', 'equipment_repair']
      },
      {
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa.brown@zoo.com',
        password: await bcrypt.hash('password123', 10),
        role: 'visitor_services',
        isActive: true,
        isVerified: true,
        permissions: ['visitor_management', 'ticket_sales', 'customer_service']
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      this.seedData.users.push(user);
    }

    logger.info(`${users.length} users seeded successfully`);
  }

  async seedExhibits() {
    logger.info('Seeding exhibits...');
    
    const exhibits = [
      {
        name: 'African Savanna',
        type: 'outdoor',
        theme: 'african_savanna',
        description: 'A large outdoor exhibit featuring African wildlife including lions, zebras, and giraffes.',
        capacity: { visitors: 150, animals: 12 },
        currentOccupancy: { visitors: 0, animals: 0 },
        size: { length: 100, width: 80, height: 15, area: 8000, unit: 'square_meters' },
        location: { building: 'Outdoor Complex', floor: 0 },
        accessibility: { wheelchairAccessible: true, audioGuide: true },
        features: ['viewing_platform', 'feeding_station', 'educational_signs'],
        operatingHours: { open: '09:00', close: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        admissionFee: { adult: 25, child: 15, senior: 20, group: 20 },
        status: 'open',
        isActive: true
      },
      {
        name: 'Tropical Rainforest',
        type: 'indoor',
        theme: 'tropical_rainforest',
        description: 'An indoor exhibit recreating the Amazon rainforest with exotic birds, monkeys, and reptiles.',
        capacity: { visitors: 80, animals: 25 },
        currentOccupancy: { visitors: 0, animals: 0 },
        size: { length: 60, width: 40, height: 20, area: 2400, unit: 'square_meters' },
        location: { building: 'Rainforest Pavilion', floor: 1 },
        accessibility: { wheelchairAccessible: true, brailleSigns: true },
        features: ['walkthrough_path', 'waterfall', 'butterfly_garden'],
        operatingHours: { open: '09:00', close: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        admissionFee: { adult: 20, child: 12, senior: 16, group: 16 },
        status: 'open',
        isActive: true
      },
      {
        name: 'Arctic Tundra',
        type: 'indoor',
        theme: 'arctic_tundra',
        description: 'A climate-controlled exhibit featuring polar bears, arctic foxes, and penguins.',
        capacity: { visitors: 60, animals: 8 },
        currentOccupancy: { visitors: 0, animals: 0 },
        size: { length: 50, width: 30, height: 12, area: 1500, unit: 'square_meters' },
        location: { building: 'Arctic Pavilion', floor: 1 },
        accessibility: { wheelchairAccessible: true, audioGuide: true },
        features: ['ice_cave', 'underwater_viewing', 'climate_control'],
        operatingHours: { open: '09:00', close: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        admissionFee: { adult: 22, child: 14, senior: 18, group: 18 },
        status: 'open',
        isActive: true
      },
      {
        name: 'Ocean World',
        type: 'aquatic',
        theme: 'ocean',
        description: 'A large aquarium featuring marine life including sharks, rays, and tropical fish.',
        capacity: { visitors: 120, animals: 50 },
        currentOccupancy: { visitors: 0, animals: 0 },
        size: { length: 80, width: 40, height: 8, area: 3200, unit: 'square_meters' },
        location: { building: 'Aquatic Center', floor: 0 },
        accessibility: { wheelchairAccessible: true, tactileElements: true },
        features: ['tunnel_walkthrough', 'touch_tank', 'feeding_shows'],
        operatingHours: { open: '09:00', close: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        admissionFee: { adult: 28, child: 18, senior: 22, group: 22 },
        status: 'open',
        isActive: true
      }
    ];

    for (const exhibitData of exhibits) {
      const exhibit = new Exhibit(exhibitData);
      await exhibit.save();
      this.seedData.exhibits.push(exhibit);
    }

    logger.info(`${exhibits.length} exhibits seeded successfully`);
  }

  async seedAnimals() {
    logger.info('Seeding animals...');
    
    const animals = [
      {
        name: 'Simba',
        species: 'Panthera leo',
        scientificName: 'Panthera leo',
        gender: 'male',
        birthDate: new Date('2018-03-15'),
        arrivalDate: new Date('2018-06-01'),
        origin: 'captive_bred',
        exhibitId: this.seedData.exhibits[0]._id, // African Savanna
        status: 'active',
        physicalDescription: {
          weight: 220,
          height: 120,
          length: 200,
          color: 'golden',
          markings: 'none',
          distinguishingFeatures: 'Large mane, scar on left ear'
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
      },
      {
        name: 'Zara',
        species: 'Giraffa camelopardalis',
        scientificName: 'Giraffa camelopardalis',
        gender: 'female',
        birthDate: new Date('2019-07-20'),
        arrivalDate: new Date('2019-10-15'),
        origin: 'captive_bred',
        exhibitId: this.seedData.exhibits[0]._id, // African Savanna
        status: 'active',
        physicalDescription: {
          weight: 800,
          height: 450,
          length: 300,
          color: 'yellow with brown spots',
          markings: 'Distinctive spot pattern',
          distinguishingFeatures: 'Very tall, unique spot pattern'
        },
        temperament: 'gentle',
        diet: {
          primary: 'leaves',
          secondary: ['fruits', 'vegetables'],
          restrictions: ['meat'],
          feedingFrequency: 'continuous',
          specialRequirements: 'High branches for feeding'
        },
        isEndangered: true,
        conservationStatus: 'vulnerable'
      },
      {
        name: 'Koko',
        species: 'Gorilla gorilla',
        scientificName: 'Gorilla gorilla',
        gender: 'male',
        birthDate: new Date('2015-11-10'),
        arrivalDate: new Date('2016-02-01'),
        origin: 'captive_bred',
        exhibitId: this.seedData.exhibits[1]._id, // Tropical Rainforest
        status: 'active',
        physicalDescription: {
          weight: 180,
          height: 170,
          length: 150,
          color: 'black',
          markings: 'none',
          distinguishingFeatures: 'Silver back, large size'
        },
        temperament: 'calm',
        diet: {
          primary: 'vegetables',
          secondary: ['fruits', 'nuts'],
          restrictions: ['meat', 'dairy'],
          feedingFrequency: 'twice_daily',
          specialRequirements: 'Enrichment activities'
        },
        isEndangered: true,
        conservationStatus: 'critically_endangered'
      },
      {
        name: 'Aurora',
        species: 'Ursus maritimus',
        scientificName: 'Ursus maritimus',
        gender: 'female',
        birthDate: new Date('2017-01-25'),
        arrivalDate: new Date('2017-04-10'),
        origin: 'captive_bred',
        exhibitId: this.seedData.exhibits[2]._id, // Arctic Tundra
        status: 'active',
        physicalDescription: {
          weight: 300,
          height: 120,
          length: 200,
          color: 'white',
          markings: 'none',
          distinguishingFeatures: 'Large size, excellent swimmer'
        },
        temperament: 'playful',
        diet: {
          primary: 'fish',
          secondary: ['seal', 'vegetables'],
          restrictions: ['processed_food'],
          feedingFrequency: 'daily',
          specialRequirements: 'Cold water access'
        },
        isEndangered: true,
        conservationStatus: 'vulnerable'
      }
    ];

    for (const animalData of animals) {
      const animal = new Animal(animalData);
      await animal.save();
      this.seedData.animals.push(animal);
      
      // Update exhibit animal count
      const exhibit = await Exhibit.findById(animal.exhibitId);
      if (exhibit) {
        exhibit.animals.push(animal._id);
        exhibit.currentOccupancy.animals = exhibit.animals.length;
        await exhibit.save();
      }
    }

    logger.info(`${animals.length} animals seeded successfully`);
  }

  async seedVisitors() {
    logger.info('Seeding visitors...');
    
    const visitors = [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'female',
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
        isVip: true,
        vipLevel: 'gold',
        totalSpent: 5000,
        totalVisits: 15,
        source: 'website'
      },
      {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
        phone: '+1987654321',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'male',
        address: {
          street: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          zipCode: '54321',
          country: 'USA'
        },
        preferences: {
          interests: ['photography', 'wildlife'],
          language: 'en',
          communicationMethod: 'email',
          newsletterSubscription: false
        },
        isVip: false,
        totalSpent: 150,
        totalVisits: 3,
        source: 'walk_in'
      },
      {
        firstName: 'Carol',
        lastName: 'Williams',
        email: 'carol.williams@example.com',
        phone: '+1555666777',
        dateOfBirth: new Date('1975-12-03'),
        gender: 'female',
        address: {
          street: '789 Pine St',
          city: 'Elsewhere',
          state: 'TX',
          zipCode: '67890',
          country: 'USA'
        },
        preferences: {
          interests: ['family', 'children'],
          language: 'en',
          communicationMethod: 'email',
          newsletterSubscription: true
        },
        membership: {
          type: 'family',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
          benefits: ['unlimited_visits', 'guest_passes', 'discounts'],
          guestPasses: 4,
          discountPercentage: 15
        },
        totalSpent: 800,
        totalVisits: 8,
        source: 'referral'
      }
    ];

    for (const visitorData of visitors) {
      const visitor = new Visitor(visitorData);
      await visitor.save();
      this.seedData.visitors.push(visitor);
    }

    logger.info(`${visitors.length} visitors seeded successfully`);
  }

  async seedStaff() {
    logger.info('Seeding staff...');
    
    const staff = [
      {
        employeeId: 'EMP001',
        firstName: 'Dr. Jane',
        lastName: 'Veterinarian',
        email: 'jane.vet@zoo.com',
        phone: '+1111111111',
        role: 'veterinarian',
        department: 'Animal Health',
        position: 'Senior Veterinarian',
        hireDate: new Date('2020-01-15'),
        salary: 75000,
        isActive: true,
        certifications: ['DVM', 'Wildlife Medicine'],
        emergencyContact: {
          name: 'John Doe',
          relationship: 'Spouse',
          phone: '+1111111112'
        }
      },
      {
        employeeId: 'EMP002',
        firstName: 'Mark',
        lastName: 'Keeper',
        email: 'mark.keeper@zoo.com',
        phone: '+2222222222',
        role: 'animal_care',
        department: 'Animal Care',
        position: 'Senior Keeper',
        hireDate: new Date('2019-06-01'),
        salary: 45000,
        isActive: true,
        certifications: ['Animal Care', 'Safety Training'],
        emergencyContact: {
          name: 'Sarah Keeper',
          relationship: 'Sister',
          phone: '+2222222223'
        }
      },
      {
        employeeId: 'EMP003',
        firstName: 'Tom',
        lastName: 'Maintenance',
        email: 'tom.maintenance@zoo.com',
        phone: '+3333333333',
        role: 'maintenance',
        department: 'Facilities',
        position: 'Maintenance Supervisor',
        hireDate: new Date('2018-03-10'),
        salary: 50000,
        isActive: true,
        certifications: ['HVAC', 'Electrical'],
        emergencyContact: {
          name: 'Mary Maintenance',
          relationship: 'Wife',
          phone: '+3333333334'
        }
      }
    ];

    for (const staffData of staff) {
      const staffMember = new Staff(staffData);
      await staffMember.save();
      this.seedData.staff.push(staffMember);
    }

    logger.info(`${staff.length} staff members seeded successfully`);
  }

  async seedFeedingSchedules() {
    logger.info('Seeding feeding schedules...');
    
    const feedings = [
      {
        animalId: this.seedData.animals[0]._id, // Simba
        animalName: 'Simba',
        exhibitId: this.seedData.exhibits[0]._id,
        foodType: 'meat',
        quantity: '5kg',
        scheduledTime: '09:00',
        completed: false,
        notes: 'Fresh beef only'
      },
      {
        animalId: this.seedData.animals[1]._id, // Zara
        animalName: 'Zara',
        exhibitId: this.seedData.exhibits[0]._id,
        foodType: 'leaves',
        quantity: '10kg',
        scheduledTime: '08:00',
        completed: true,
        completedBy: 'Mark Keeper',
        completedAt: new Date(),
        notes: 'Acacia leaves preferred'
      },
      {
        animalId: this.seedData.animals[2]._id, // Koko
        animalName: 'Koko',
        exhibitId: this.seedData.exhibits[1]._id,
        foodType: 'vegetables',
        quantity: '3kg',
        scheduledTime: '10:00',
        completed: false,
        notes: 'Include enrichment items'
      }
    ];

    for (const feedingData of feedings) {
      const feeding = new Feeding(feedingData);
      await feeding.save();
      this.seedData.feedings.push(feeding);
    }

    logger.info(`${feedings.length} feeding schedules seeded successfully`);
  }

  async seedHealthRecords() {
    logger.info('Seeding health records...');
    
    const healthRecords = [
      {
        animalId: this.seedData.animals[0]._id, // Simba
        animalName: 'Simba',
        date: new Date('2024-01-15'),
        veterinarian: 'Dr. Jane Veterinarian',
        diagnosis: 'Routine checkup',
        treatment: 'Vaccination and dental cleaning',
        medication: [{
          name: 'Rabies Vaccine',
          dosage: '1ml',
          frequency: 'annually',
          duration: '1 year'
        }],
        notes: 'Animal is in excellent health',
        cost: 250,
        followUpDate: new Date('2024-07-15')
      },
      {
        animalId: this.seedData.animals[1]._id, // Zara
        animalName: 'Zara',
        date: new Date('2024-02-01'),
        veterinarian: 'Dr. Jane Veterinarian',
        diagnosis: 'Minor foot injury',
        treatment: 'Antibiotic ointment and rest',
        medication: [{
          name: 'Antibiotic Ointment',
          dosage: 'Apply twice daily',
          frequency: 'twice daily',
          duration: '1 week'
        }],
        notes: 'Injury healing well, continue monitoring',
        cost: 150,
        followUpDate: new Date('2024-02-08')
      }
    ];

    for (const healthData of healthRecords) {
      const healthRecord = new HealthRecord(healthData);
      await healthRecord.save();
      this.seedData.healthRecords.push(healthRecord);
    }

    logger.info(`${healthRecords.length} health records seeded successfully`);
  }

  async seedTickets() {
    logger.info('Seeding tickets...');
    
    const tickets = [
      {
        ticketId: 'TKT-2024-001',
        visitorId: this.seedData.visitors[0]._id,
        type: 'adult',
        price: 25,
        purchaseDate: new Date('2024-01-10'),
        visitDate: new Date('2024-01-15'),
        isUsed: true,
        usedAt: new Date('2024-01-15'),
        paymentMethod: 'credit_card',
        transactionId: 'TXN001'
      },
      {
        ticketId: 'TKT-2024-002',
        visitorId: this.seedData.visitors[1]._id,
        type: 'child',
        price: 15,
        purchaseDate: new Date('2024-01-12'),
        visitDate: new Date('2024-01-20'),
        isUsed: false,
        paymentMethod: 'online',
        transactionId: 'TXN002'
      }
    ];

    for (const ticketData of tickets) {
      const ticket = new Ticket(ticketData);
      await ticket.save();
      this.seedData.tickets.push(ticket);
    }

    logger.info(`${tickets.length} tickets seeded successfully`);
  }

  async seedReports() {
    logger.info('Seeding reports...');
    
    const reports = [
      {
        title: 'Monthly Animal Health Report',
        type: 'health',
        period: 'monthly',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        generatedBy: this.seedData.users[0]._id,
        data: {
          totalAnimals: 4,
          healthChecks: 8,
          vaccinations: 4,
          treatments: 2,
          totalCost: 1200
        },
        summary: 'All animals are in good health. Routine vaccinations completed.',
        recommendations: ['Continue regular health monitoring', 'Schedule dental cleaning for Simba']
      },
      {
        title: 'Visitor Analytics Report',
        type: 'visitor',
        period: 'monthly',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        generatedBy: this.seedData.users[0]._id,
        data: {
          totalVisitors: 1250,
          totalRevenue: 25000,
          averageSpending: 20,
          vipVisitors: 45,
          membershipSales: 12
        },
        summary: 'Strong visitor numbers with good revenue growth.',
        recommendations: ['Increase marketing for VIP program', 'Consider seasonal promotions']
      }
    ];

    for (const reportData of reports) {
      const report = new Report(reportData);
      await report.save();
      this.seedData.reports.push(report);
    }

    logger.info(`${reports.length} reports seeded successfully`);
  }

  async seed() {
    try {
      await this.connect();
      
      const clearData = process.argv.includes('--clear');
      if (clearData) {
        await this.clearDatabase();
      }
      
      logger.info('Starting database seeding...');
      
      await this.seedUsers();
      await this.seedExhibits();
      await this.seedAnimals();
      await this.seedVisitors();
      await this.seedStaff();
      await this.seedFeedingSchedules();
      await this.seedHealthRecords();
      await this.seedTickets();
      await this.seedReports();
      
      logger.info('Database seeding completed successfully!');
      logger.info('Summary:');
      logger.info(`  Users: ${this.seedData.users.length}`);
      logger.info(`  Exhibits: ${this.seedData.exhibits.length}`);
      logger.info(`  Animals: ${this.seedData.animals.length}`);
      logger.info(`  Visitors: ${this.seedData.visitors.length}`);
      logger.info(`  Staff: ${this.seedData.staff.length}`);
      logger.info(`  Feedings: ${this.seedData.feedings.length}`);
      logger.info(`  Health Records: ${this.seedData.healthRecords.length}`);
      logger.info(`  Tickets: ${this.seedData.tickets.length}`);
      logger.info(`  Reports: ${this.seedData.reports.length}`);
      
    } catch (error) {
      logger.error('Database seeding failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
async function main() {
  const seeder = new DatabaseSeeder();
  
  try {
    await seeder.seed();
  } catch (error) {
    logger.error('Seeding command failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseSeeder;
