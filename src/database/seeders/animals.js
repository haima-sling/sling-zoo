const Animal = require('../../models/Animal');
const logger = require('../../utils/logger');

const animalSeedData = [
  {
    name: 'Simba',
    species: 'Panthera leo',
    scientificName: 'Panthera leo',
    gender: 'male',
    birthDate: new Date('2018-03-15'),
    arrivalDate: new Date('2018-06-01'),
    origin: 'captive_bred',
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
    conservationStatus: 'vulnerable',
    microchipId: 'CHIP001',
    tags: ['big_cat', 'carnivore', 'endangered']
  },
  {
    name: 'Raja',
    species: 'Panthera tigris',
    scientificName: 'Panthera tigris tigris',
    gender: 'male',
    birthDate: new Date('2019-07-15'),
    arrivalDate: new Date('2020-01-10'),
    origin: 'captive_bred',
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
    microchipId: 'CHIP002',
    tags: ['big_cat', 'carnivore', 'critically_endangered']
  },
  {
    name: 'Zara',
    species: 'Giraffa camelopardalis',
    scientificName: 'Giraffa camelopardalis',
    gender: 'female',
    birthDate: new Date('2019-07-20'),
    arrivalDate: new Date('2019-10-15'),
    origin: 'captive_bred',
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
    conservationStatus: 'vulnerable',
    microchipId: 'CHIP003',
    tags: ['herbivore', 'endangered']
  },
  {
    name: 'Koko',
    species: 'Gorilla gorilla',
    scientificName: 'Gorilla gorilla',
    gender: 'male',
    birthDate: new Date('2015-11-10'),
    arrivalDate: new Date('2016-02-01'),
    origin: 'captive_bred',
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
    conservationStatus: 'critically_endangered',
    microchipId: 'CHIP004',
    tags: ['primate', 'herbivore', 'critically_endangered']
  },
  {
    name: 'Aurora',
    species: 'Ursus maritimus',
    scientificName: 'Ursus maritimus',
    gender: 'female',
    birthDate: new Date('2017-01-25'),
    arrivalDate: new Date('2017-04-10'),
    origin: 'captive_bred',
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
    conservationStatus: 'vulnerable',
    microchipId: 'CHIP005',
    tags: ['carnivore', 'arctic', 'endangered']
  }
];

async function seedAnimals(exhibitIds) {
  try {
    logger.info('Seeding animals...');

    if (!exhibitIds || exhibitIds.length === 0) {
      throw new Error('No exhibit IDs provided for animal seeding');
    }

    const animals = [];
    
    for (let i = 0; i < animalSeedData.length; i++) {
      const animalData = animalSeedData[i];
      animalData.exhibitId = exhibitIds[i % exhibitIds.length];
      
      const animal = new Animal(animalData);
      await animal.save();
      animals.push(animal);
      
      logger.info(`Created animal: ${animal.name} (${animal.species})`);
    }

    logger.info(`Successfully seeded ${animals.length} animals`);
    return animals;
  } catch (error) {
    logger.error('Error seeding animals:', error);
    throw error;
  }
}

module.exports = { seedAnimals, animalSeedData };
