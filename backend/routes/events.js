const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const VendorRequest = require('../models/VendorRequest');
const mongoose = require('mongoose');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/events');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Create a new event
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Received event data:', req.body);
    console.log('Received files:', req.files);

    // Parse vendorRequirements if sent as string (from FormData)
    let vendorRequirements = [];
    if (req.body.vendorRequirements) {
      if (typeof req.body.vendorRequirements === 'string') {
        try {
          vendorRequirements = JSON.parse(req.body.vendorRequirements);
        } catch (e) {
          console.error('Error parsing vendorRequirements:', e);
          return res.status(400).json({ message: 'Invalid vendor requirements format' });
        }
      } else {
        vendorRequirements = req.body.vendorRequirements;
      }
    }

    // Convert string values to appropriate types
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      eventType: req.body.eventType,
      date: new Date(req.body.date),
      location: req.body.location,
      organizer: req.user.userId,
      status: 'upcoming',
      images: req.files ? req.files.map(file => `/uploads/events/${file.filename}`) : [],
      vendorRequirements: vendorRequirements.map(req => ({
        category: req.category,
        description: req.description,
        budget: Number(req.budget),
        status: 'open',
        assignedVendor: null
      }))
    };

    // Add optional fields if they exist
    if (req.body.budget) {
      eventData.budget = Number(req.body.budget);
    }
    if (req.body.guestCount) {
      eventData.guestCount = Number(req.body.guestCount);
    }

    console.log('Creating event with data:', eventData);

    const event = new Event(eventData);
    await event.save();
    
    console.log('Event created successfully:', event);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events by type
router.get('/type/:type', async (req, res) => {
  try {
    const events = await Event.find({ eventType: req.params.type })
      .populate('organizer', 'name email')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured events (for now, just return all events, or add your own logic)
router.get('/featured', async (req, res) => {
  try {
    // You can add your own logic to select featured events
    const events = await Event.find().sort({ date: 1 }).limit(6);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events for the logged-in user
router.get('/my-events', auth, async (req, res) => {
  try {
    console.log('Fetching events for user:', req.user);
    if (!req.user || !req.user.userId) {
      console.error('No userId found in req.user:', req.user);
      return res.status(401).json({ message: 'Unauthorized: No userId found', user: req.user });
    }

    // Convert userId to ObjectId if it's a string
    const userId = typeof req.user.userId === 'string' 
      ? new mongoose.Types.ObjectId(req.user.userId)
      : req.user.userId;

    const query = { organizer: userId };
    console.log('Event query:', query);
    
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .populate('vendorRequirements.assignedVendor', 'name email')
      .sort({ date: -1 }); // Sort by date descending (newest first)
    
    if (events.length === 0) {
      console.warn('No events found for user:', userId);
    }
    console.log('Found events:', events.length);
    res.json(events);
  } catch (err) {
    console.error('Error fetching user events:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Create test event with open requirements
router.post('/test-event', auth, async (req, res) => {
  try {
    const testEvent = new Event({
      title: 'Test Wedding Event',
      description: 'A test wedding event with open vendor requirements',
      eventType: 'wedding',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      location: 'Test Venue, Test City',
      organizer: req.user.userId,
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
    res.status(201).json(testEvent);
  } catch (error) {
    console.error('Error creating test event:', error);
    res.status(500).json({ message: 'Error creating test event', error: error.message });
  }
});

// Get all vendor proposals for a specific event (organizer only)
router.get('/:id/proposals', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const proposals = await VendorRequest.find({ event: req.params.id })
      .populate('vendor', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proposals', error: error.message });
  }
});

// Get event analytics for the logged-in user
router.get('/analytics', auth, async (req, res) => {
  try {
    console.log('Analytics requested for req.user:', req.user);
    if (!req.user || !req.user.userId) {
      console.error('No userId found in req.user:', req.user);
      return res.status(401).json({ message: 'Unauthorized: No userId found', user: req.user });
    }
    const userId = typeof req.user.userId === 'string' 
      ? new mongoose.Types.ObjectId(req.user.userId)
      : req.user.userId;

    console.log('Analytics requested for userId:', userId);

    // Get all events for the user
    const events = await Event.find({ organizer: userId });
    console.log('Events found for analytics:', events.length);
    if (events.length > 0) {
      events.forEach(e => console.log('Event organizer:', e.organizer, 'Event title:', e.title));
    }

    // Calculate basic statistics
    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
    const completedEvents = events.filter(e => new Date(e.date) < new Date()).length;
    const totalBudget = events.reduce((sum, e) => sum + (e.budget || 0), 0);

    // Calculate event type distribution
    const eventTypeCount = {};
    events.forEach(e => {
      eventTypeCount[e.eventType] = (eventTypeCount[e.eventType] || 0) + 1;
    });
    const eventTypeDistribution = Object.entries(eventTypeCount).map(([name, value]) => ({
      name,
      value
    }));

    // Calculate vendor requirements statistics
    const vendorStats = {};
    events.forEach(e => {
      e.vendorRequirements.forEach(req => {
        if (!vendorStats[req.category]) {
          vendorStats[req.category] = { open: 0, assigned: 0, completed: 0 };
        }
        vendorStats[req.category][req.status]++;
      });
    });
    const vendorStatsArray = Object.entries(vendorStats).map(([category, stats]) => ({
      category,
      ...stats
    }));

    res.json({
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalBudget,
      eventTypeDistribution,
      vendorStats: vendorStatsArray
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ 
      message: 'Error fetching analytics',
      error: err.message
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching event with ID:', req.params.id);
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('vendorRequirements.assignedVendor', 'name email');
    if (!event) {
      console.log('Event not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log('Event found:', event);
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      message: 'Error fetching event details',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await event.remove();
    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add vendor requirement to event
router.post('/:id/vendor-requirements', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    event.vendorRequirements.push(req.body);
    await event.save();
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 