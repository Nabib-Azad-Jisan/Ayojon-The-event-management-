const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
require('dotenv').config();

async function createTestEvent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find an admin user to be the organizer
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Create test event
    const testEvent = new Event({
      title: 'Test Wedding Event',
      description: 'A test wedding event with open vendor requirements',
      eventType: 'wedding',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      location: 'Test Venue, Test City',
      organizer: admin._id,
      status: 'upcoming',
      vendorRequirements: [
        {
          category: 'catering',
          description: 'Need catering service for 100 guests',
          budget: 5000,
          status: 'open'
        },
        {
          category: 'photography',
          description: 'Need professional photographer for 8 hours',
          budget: 2000,
          status: 'open'
        },
        {
          category: 'decoration',
          description: 'Need wedding decoration for venue',
          budget: 3000,
          status: 'open'
        }
      ],
      budget: 10000,
      guestCount: 100
    });

    await testEvent.save();
    console.log('Test event created successfully:', testEvent);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test event:', error);
    process.exit(1);
  }
}

createTestEvent(); 