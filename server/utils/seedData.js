const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Service = require('../models/Service');
const SparePart = require('../models/SparePart');
const User = require('../models/User');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Category.deleteMany();
    await Service.deleteMany();
    await SparePart.deleteMany();
    await User.deleteMany();
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin'
    });
    
    // Create categories
    const categories = await Category.create([
      {
        name: 'Air Conditioner',
        description: 'All types of air conditioning units',
        brands: [
          {
            name: 'LG',
            models: [
              { name: 'Split AC 1.5 Ton', yearFrom: 2020, yearTo: 2025 },
              { name: 'Window AC 1 Ton', yearFrom: 2019, yearTo: 2024 }
            ]
          },
          {
            name: 'Voltas',
            models: [
              { name: 'Inverter AC 1.5 Ton', yearFrom: 2021, yearTo: 2025 },
              { name: 'Split AC 2 Ton', yearFrom: 2020, yearTo: 2025 }
            ]
          }
        ]
      },
      {
        name: 'Inverter',
        description: 'Power inverters and UPS systems',
        brands: [
          {
            name: 'Luminous',
            models: [
              { name: 'Zelio+ 1100', yearFrom: 2020, yearTo: 2025 },
              { name: 'Cruze 2KVA', yearFrom: 2019, yearTo: 2024 }
            ]
          },
          {
            name: 'Microtek',
            models: [
              { name: 'UPS EB 900', yearFrom: 2021, yearTo: 2025 },
              { name: 'Inverter SW 1650', yearFrom: 2020, yearTo: 2025 }
            ]
          }
        ]
      },
      {
        name: 'Refrigerator',
        description: 'All types of refrigerators and freezers',
        brands: [
          {
            name: 'Samsung',
            models: [
              { name: 'Double Door 253L', yearFrom: 2020, yearTo: 2025 },
              { name: 'Side by Side 700L', yearFrom: 2021, yearTo: 2025 }
            ]
          },
          {
            name: 'Whirlpool',
            models: [
              { name: 'Single Door 190L', yearFrom: 2019, yearTo: 2024 },
              { name: 'Triple Door 330L', yearFrom: 2020, yearTo: 2025 }
            ]
          }
        ]
      },
      {
        name: 'Washing Machine',
        description: 'Front load and top load washing machines',
        brands: [
          {
            name: 'IFB',
            models: [
              { name: 'Front Load 6kg', yearFrom: 2020, yearTo: 2025 },
              { name: 'Top Load 7.5kg', yearFrom: 2021, yearTo: 2025 }
            ]
          },
          {
            name: 'Bosch',
            models: [
              { name: 'Front Load 8kg', yearFrom: 2020, yearTo: 2025 },
              { name: 'Front Load 7kg', yearFrom: 2019, yearTo: 2024 }
            ]
          }
        ]
      }
    ]);
    
    // Create services for each category
    const serviceTypes = [
      { name: 'Repair Service', type: 'repair', basePrice: 500, duration: 120 },
      { name: 'Installation Service', type: 'installation', basePrice: 800, duration: 180 },
      { name: 'Maintenance Service', type: 'maintenance', basePrice: 400, duration: 90 },
      { name: 'Deep Cleaning', type: 'cleaning', basePrice: 600, duration: 120 }
    ];
    
    const services = [];
    for (const category of categories) {
      for (const serviceType of serviceTypes) {
        services.push({
          name: `${category.name} ${serviceType.name}`,
          category: category._id,
          description: `Professional ${serviceType.name.toLowerCase()} for ${category.name}`,
          serviceType: serviceType.type,
          price: { base: serviceType.basePrice },
          duration: serviceType.duration,
          includedServices: [
            'Professional diagnosis',
            'Genuine parts (if required)',
            '30-day service warranty',
            'Safety compliance check'
          ]
        });
      }
    }
    await Service.create(services);
    
    // Create spare parts
    const spareParts = [
      {
        name: 'AC Compressor',
        partNumber: 'AC-COMP-001',
        category: categories[0]._id,
        compatibility: [
          { brand: 'LG', models: ['Split AC 1.5 Ton'], yearFrom: 2020, yearTo: 2025 },
          { brand: 'Voltas', models: ['Inverter AC 1.5 Ton'], yearFrom: 2021, yearTo: 2025 }
        ],
        description: 'High-efficiency compressor for split AC units',
        price: { amount: 8500 },
        stock: 25,
        warranty: { duration: 12, description: '1 year replacement warranty' }
      },
      {
        name: 'Inverter Battery',
        partNumber: 'INV-BAT-001',
        category: categories[1]._id,
        compatibility: [
          { brand: 'Luminous', models: ['Zelio+ 1100', 'Cruze 2KVA'], yearFrom: 2019, yearTo: 2025 },
          { brand: 'Microtek', models: ['UPS EB 900'], yearFrom: 2021, yearTo: 2025 }
        ],
        description: '150Ah tubular battery for inverters',
        price: { amount: 12000 },
        stock: 15,
        warranty: { duration: 36, description: '3 years replacement warranty' }
      },
      {
        name: 'Refrigerator Door Seal',
        partNumber: 'REF-SEAL-001',
        category: categories[2]._id,
        compatibility: [
          { brand: 'Samsung', models: ['Double Door 253L'], yearFrom: 2020, yearTo: 2025 },
          { brand: 'Whirlpool', models: ['Triple Door 330L'], yearFrom: 2020, yearTo: 2025 }
        ],
        description: 'Magnetic door seal/gasket for refrigerators',
        price: { amount: 1200 },
        stock: 50,
        warranty: { duration: 6, description: '6 months warranty' }
      },
      {
        name: 'Washing Machine Drain Pump',
        partNumber: 'WM-PUMP-001',
        category: categories[3]._id,
        compatibility: [
          { brand: 'IFB', models: ['Front Load 6kg', 'Top Load 7.5kg'], yearFrom: 2020, yearTo: 2025 },
          { brand: 'Bosch', models: ['Front Load 8kg'], yearFrom: 2020, yearTo: 2025 }
        ],
        description: 'Universal drain pump for washing machines',
        price: { amount: 2500 },
        stock: 30,
        warranty: { duration: 12, description: '1 year warranty' }
      }
    ];
    await SparePart.create(spareParts);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

module.exports = {seedDatabase}
