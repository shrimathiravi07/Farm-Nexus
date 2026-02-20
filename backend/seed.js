const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Slot = require('./models/Slot');
const Appointment = require('./models/Appointment');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        console.log('⏳ Connecting to MongoDB for seeding...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        // Clear existing data
        await User.deleteMany();
        await Equipment.deleteMany();
        await Slot.deleteMany();
        await Appointment.deleteMany();

        console.log('🗑 Existing data cleared.');

        // Create Users
        const commonPassword = 'password123';

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@farmnexus.com',
            password: commonPassword,
            role: 'admin',
            phone: '1234567890'
        });

        const provider = await User.create({
            name: 'Equipment Provider',
            email: 'provider@farmnexus.com',
            password: commonPassword,
            role: 'provider',
            phone: '9876543210'
        });

        const farmer = await User.create({
            name: 'John Farmer',
            email: 'farmer@farmnexus.com',
            password: commonPassword,
            role: 'farmer',
            phone: '5556667777'
        });

        console.log('👥 Users created (Password: password123)');

        // Create 5 Equipments/Services based on Use Cases
        const tractor = await Equipment.create({
            name: 'John Deere Tractor',
            description: 'Powerful tractor for heavy-duty farming and tilling tasks.',
            category: 'Tractor',
            pricePerHour: 500,
            provider: provider._id
        });

        const irrigation = await Equipment.create({
            name: 'Main Canal Water Slot',
            description: 'Timed access to canal water sharing system for irrigation.',
            category: 'Irrigation',
            pricePerHour: 100,
            provider: provider._id
        });

        const drone = await Equipment.create({
            name: 'Pesticide Drone X1',
            description: 'High-precision drone spraying service for pesticide application.',
            category: 'Drone',
            pricePerHour: 1200,
            provider: provider._id
        });

        const harvester = await Equipment.create({
            name: 'Modern Combine Harvester',
            description: 'High-efficiency harvester for wheat, rice, and corn crops.',
            category: 'Harvesting',
            pricePerHour: 800,
            provider: provider._id
        });

        const soilLab = await Equipment.create({
            name: 'Precision Soil Testing Lab',
            description: 'Appointment for soil sample submission and detailed nutrient analysis.',
            category: 'Lab',
            pricePerHour: 300,
            provider: provider._id
        });

        console.log('🚜 5 Agriculture Use Cases created.');

        // Create Slots
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const slotData = [];

        // Dedicated slots for each category
        const items = [tractor, irrigation, drone, harvester, soilLab];
        items.forEach(item => {
            // Today Slot
            slotData.push({
                equipment: item._id,
                provider: provider._id,
                date: today,
                startTime: '08:00',
                endTime: '11:00',
                isBooked: false
            });
            // Tomorrow Slot
            slotData.push({
                equipment: item._id,
                provider: provider._id,
                date: tomorrow,
                startTime: '13:00',
                endTime: '16:00',
                isBooked: false
            });
        });

        await Slot.create(slotData);

        console.log('📅 Availability slots created for all services.');

        console.log('✨ Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
