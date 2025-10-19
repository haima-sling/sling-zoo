const Exhibit = require('../../models/Exhibit');
const logger = require('../../utils/logger');

const exhibitSeedData = [
  {
    name: 'African Savanna',
    type: 'outdoor',
    theme: 'african_savanna',
    description: 'A large outdoor exhibit featuring African wildlife including lions, zebras, and giraffes. The habitat recreates the open grasslands of the African savanna with authentic vegetation and terrain.',
    capacity: {
      visitors: 150,
      animals: 12
    },
    currentOccupancy: {
      visitors: 0,
      animals: 0
    },
    size: {
      length: 100,
      width: 80,
      height: 15,
      area: 8000,
      unit: 'square_meters'
    },
    location: {
      building: 'Outdoor Complex',
      floor: 0,
      coordinates: { x: 100, y: 200, z: 0 }
    },
    accessibility: {
      wheelchairAccessible: true,
      audioGuide: true,
      brailleSigns: false,
      tactileElements: false
    },
    features: ['viewing_platform', 'feeding_station', 'educational_signs', 'shaded_areas'],
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
    },
    status: 'open',
    isActive: true
  },
  {
    name: 'Tropical Rainforest',
    type: 'indoor',
    theme: 'tropical_rainforest',
    description: 'An indoor exhibit recreating the Amazon rainforest with exotic birds, monkeys, and reptiles. Features a climate-controlled environment with waterfalls and authentic rainforest vegetation.',
    capacity: {
      visitors: 80,
      animals: 25
    },
    currentOccupancy: {
      visitors: 0,
      animals: 0
    },
    size: {
      length: 60,
      width: 40,
      height: 20,
      area: 2400,
      unit: 'square_meters'
    },
    location: {
      building: 'Rainforest Pavilion',
      floor: 1,
      coordinates: { x: 50, y: 150, z: 0 }
    },
    accessibility: {
      wheelchairAccessible: true,
      audioGuide: true,
      brailleSigns: true,
      tactileElements: false
    },
    features: ['walkthrough_path', 'waterfall', 'butterfly_garden', 'misting_system'],
    operatingHours: {
      open: '09:00',
      close: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    admissionFee: {
      adult: 20,
      child: 12,
      senior: 16,
      group: 16
    },
    status: 'open',
    isActive: true
  },
  {
    name: 'Arctic Tundra',
    type: 'indoor',
    theme: 'arctic_tundra',
    description: 'A climate-controlled exhibit featuring polar bears, arctic foxes, and penguins. Maintains sub-zero temperatures and includes ice features and cold-water pools.',
    capacity: {
      visitors: 60,
      animals: 8
    },
    currentOccupancy: {
      visitors: 0,
      animals: 0
    },
    size: {
      length: 50,
      width: 30,
      height: 12,
      area: 1500,
      unit: 'square_meters'
    },
    location: {
      building: 'Arctic Pavilion',
      floor: 1,
      coordinates: { x: 75, y: 100, z: 0 }
    },
    accessibility: {
      wheelchairAccessible: true,
      audioGuide: true,
      brailleSigns: false,
      tactileElements: false
    },
    features: ['ice_cave', 'underwater_viewing', 'climate_control', 'cold_water_pool'],
    operatingHours: {
      open: '09:00',
      close: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    admissionFee: {
      adult: 22,
      child: 14,
      senior: 18,
      group: 18
    },
    status: 'open',
    isActive: true
  },
  {
    name: 'Ocean World',
    type: 'aquatic',
    theme: 'ocean',
    description: 'A large aquarium featuring marine life including sharks, rays, and tropical fish. Includes a tunnel walkthrough for immersive viewing and interactive touch tanks.',
    capacity: {
      visitors: 120,
      animals: 50
    },
    currentOccupancy: {
      visitors: 0,
      animals: 0
    },
    size: {
      length: 80,
      width: 40,
      height: 8,
      area: 3200,
      unit: 'square_meters'
    },
    location: {
      building: 'Aquatic Center',
      floor: 0,
      coordinates: { x: 120, y: 180, z: 0 }
    },
    accessibility: {
      wheelchairAccessible: true,
      audioGuide: true,
      brailleSigns: false,
      tactileElements: true
    },
    features: ['tunnel_walkthrough', 'touch_tank', 'feeding_shows', 'interactive_displays'],
    operatingHours: {
      open: '09:00',
      close: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    admissionFee: {
      adult: 28,
      child: 18,
      senior: 22,
      group: 22
    },
    status: 'open',
    isActive: true
  }
];

async function seedExhibits() {
  try {
    logger.info('Seeding exhibits...');

    const exhibits = [];
    
    for (const exhibitData of exhibitSeedData) {
      const exhibit = new Exhibit(exhibitData);
      await exhibit.save();
      exhibits.push(exhibit);
      
      logger.info(`Created exhibit: ${exhibit.name}`);
    }

    logger.info(`Successfully seeded ${exhibits.length} exhibits`);
    return exhibits;
  } catch (error) {
    logger.error('Error seeding exhibits:', error);
    throw error;
  }
}

module.exports = { seedExhibits, exhibitSeedData };
