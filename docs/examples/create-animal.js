const axios = require('axios');

// Example: Creating an animal in the zoo management system

const API_BASE_URL = 'http://localhost:3000/api';

async function createAnimal() {
  try {
    // Step 1: Login to get authentication token
    console.log('Step 1: Authenticating...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@zoo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✓ Authentication successful');

    // Step 2: Get list of available exhibits
    console.log('\nStep 2: Fetching available exhibits...');
    const exhibitsResponse = await axios.get(`${API_BASE_URL}/exhibits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const exhibits = exhibitsResponse.data.data;
    console.log(`✓ Found ${exhibits.length} exhibits`);
    
    if (exhibits.length === 0) {
      throw new Error('No exhibits available. Please create an exhibit first.');
    }

    // Step 3: Create a new animal
    console.log('\nStep 3: Creating new animal...');
    const animalData = {
      name: 'Raja',
      species: 'Panthera tigris',
      scientificName: 'Panthera tigris tigris',
      gender: 'male',
      birthDate: '2019-07-15',
      arrivalDate: '2020-01-10',
      origin: 'captive_bred',
      exhibitId: exhibits[0]._id,
      status: 'active',
      physicalDescription: {
        weight: 250,
        height: 110,
        length: 280,
        color: 'orange with black stripes',
        markings: 'Distinctive stripe pattern',
        distinguishingFeatures: 'White spot on left ear'
      },
      temperament: 'territorial',
      diet: {
        primary: 'meat',
        secondary: ['bones', 'organs'],
        restrictions: ['processed_food', 'dairy'],
        feedingFrequency: 'daily',
        specialRequirements: 'Fresh meat only, feed in evening'
      },
      isEndangered: true,
      conservationStatus: 'endangered',
      microchipId: 'CHIP-2020-001',
      tags: ['big_cat', 'carnivore', 'endangered'],
      notes: 'Requires experienced handlers. Very protective of territory.'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/animals`, animalData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const createdAnimal = createResponse.data.data;
    console.log('✓ Animal created successfully');
    console.log('\nAnimal Details:');
    console.log(`  ID: ${createdAnimal._id}`);
    console.log(`  Name: ${createdAnimal.name}`);
    console.log(`  Species: ${createdAnimal.species}`);
    console.log(`  Gender: ${createdAnimal.gender}`);
    console.log(`  Exhibit: ${exhibits[0].name}`);
    console.log(`  Status: ${createdAnimal.status}`);

    // Step 4: Create initial feeding schedule
    console.log('\nStep 4: Creating feeding schedule...');
    const feedingData = {
      animalId: createdAnimal._id,
      foodType: 'fresh meat',
      quantity: '8kg',
      scheduledTime: '18:00',
      specialInstructions: 'Feed in secure area away from visitors',
      notes: 'Prefers beef and chicken'
    };

    await axios.post(`${API_BASE_URL}/feedings`, feedingData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Feeding schedule created');

    // Step 5: Create initial health record
    console.log('\nStep 5: Creating initial health record...');
    const healthData = {
      animalId: createdAnimal._id,
      date: new Date(),
      veterinarian: 'Dr. Sarah Johnson',
      type: 'checkup',
      diagnosis: 'Initial health assessment - excellent condition',
      treatment: 'Vaccinations and baseline health check',
      medication: [
        {
          name: 'Rabies Vaccine',
          dosage: '2ml',
          frequency: 'annually',
          duration: '1 year'
        },
        {
          name: 'Deworming Treatment',
          dosage: '50mg',
          frequency: 'quarterly',
          duration: '3 months'
        }
      ],
      vitals: {
        temperature: 38.5,
        weight: 250,
        heartRate: 45,
        respiratoryRate: 18
      },
      cost: 450,
      notes: 'Animal is in excellent health. Continue regular monitoring.'
    };

    await axios.post(`${API_BASE_URL}/health-records`, healthData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Health record created');

    console.log('\n✅ Animal setup completed successfully!');
    console.log(`\nYou can view the animal at: ${API_BASE_URL}/animals/${createdAnimal._id}`);

    return createdAnimal;

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    
    if (error.response?.data?.errors) {
      console.error('\nValidation Errors:');
      error.response.data.errors.forEach(err => {
        console.error(`  - ${err.field}: ${err.message}`);
      });
    }
    
    throw error;
  }
}

// Run the example
if (require.main === module) {
  createAnimal()
    .then(() => {
      console.log('\nExample completed successfully');
      process.exit(0);
    })
    .catch(() => {
      console.log('\nExample failed');
      process.exit(1);
    });
}

module.exports = createAnimal;
