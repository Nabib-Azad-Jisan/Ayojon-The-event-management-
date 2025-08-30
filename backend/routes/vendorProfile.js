const express = require('express');
const router = express.Router();
const VendorProfile = require('../models/VendorProfile');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/vendor/profile
// @desc    Get vendor profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    let profile = await VendorProfile.findOne({ vendor: req.user.userId })
      .populate('vendor', ['name', 'email', 'profilePicture']);
    
    if (!profile) {
      // Create a default profile if none exists
      profile = new VendorProfile({
        vendor: req.user.userId,
        businessName: 'My Business',
        description: 'Welcome to my vendor profile!',
        categories: ['Other'],
        portfolio: {
          images: [],
          videos: [],
          testimonials: []
        },
        availability: {
          schedule: [],
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          advanceBookingDays: 30
        },
        services: [],
        performance: {
          totalEvents: 0,
          averageRating: 0,
          responseTime: 0,
          completionRate: 0,
          revenue: 0
        }
      });
      await profile.save();
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/vendor/profile
// @desc    Create or update vendor profile
// @access  Private
router.post('/profile', [
  auth,
  [
    check('businessName', 'Business name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('categories', 'At least one category is required').isArray({ min: 1 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    businessName,
    description,
    categories,
    portfolio,
    availability,
    services,
    location,
    contact
  } = req.body;

  try {
    let profile = await VendorProfile.findOne({ vendor: req.user.userId });

    if (profile) {
      // Update
      profile = await VendorProfile.findOneAndUpdate(
        { vendor: req.user.userId },
        { $set: {
          businessName,
          description,
          categories,
          portfolio,
          availability,
          services,
          location,
          contact,
          updatedAt: Date.now()
        }},
        { new: true }
      );
    } else {
      // Create
      profile = new VendorProfile({
        vendor: req.user.userId,
        businessName,
        description,
        categories,
        portfolio,
        availability,
        services,
        location,
        contact
      });
      await profile.save();
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/vendor/availability
// @desc    Get vendor availability for a date range
// @access  Private
router.get('/availability', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const profile = await VendorProfile.findOne({ vendor: req.user.userId });

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    const availability = profile.availability.schedule.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= new Date(startDate) && slotDate <= new Date(endDate);
    });

    res.json(availability);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/vendor/availability
// @desc    Update vendor availability
// @access  Private
router.post('/availability', auth, async (req, res) => {
  try {
    const { date, status } = req.body;
    const profile = await VendorProfile.findOne({ vendor: req.user.userId });

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    const existingSlot = profile.availability.schedule.find(
      slot => new Date(slot.date).toISOString() === new Date(date).toISOString()
    );

    if (existingSlot) {
      existingSlot.status = status;
    } else {
      profile.availability.schedule.push({ date, status });
    }

    await profile.save();
    res.json(profile.availability);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/vendor/portfolio
// @desc    Get vendor portfolio
// @access  Public
router.get('/portfolio/:vendorId', async (req, res) => {
  try {
    const profile = await VendorProfile.findOne({ vendor: req.params.vendorId })
      .select('portfolio');

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile.portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/vendor/portfolio
// @desc    Add item to vendor portfolio
// @access  Private
router.post('/portfolio', auth, async (req, res) => {
  try {
    const { type, url, caption, category } = req.body;
    const profile = await VendorProfile.findOne({ vendor: req.user.userId });

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    if (type === 'image') {
      profile.portfolio.images.push({ url, caption, category });
    } else if (type === 'video') {
      profile.portfolio.videos.push({ url, caption, category });
    }

    await profile.save();
    res.json(profile.portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/vendor/performance
// @desc    Get vendor performance metrics
// @access  Private
router.get('/performance', auth, async (req, res) => {
  try {
    const profile = await VendorProfile.findOne({ vendor: req.user.userId })
      .select('performance');

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile.performance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/vendor/match
// @desc    Find matching vendors for an event
// @access  Private
router.get('/match', auth, async (req, res) => {
  try {
    const { category, date, budget, location } = req.query;
    
    const matchingVendors = await VendorProfile.find({
      categories: category,
      'availability.schedule': {
        $elemMatch: {
          date: new Date(date),
          status: 'available'
        }
      },
      'services.price': { $lte: budget }
    }).populate('vendor', ['name', 'email', 'profilePicture']);

    // Sort by performance metrics
    const sortedVendors = matchingVendors.sort((a, b) => {
      const scoreA = (a.performance.averageRating * 0.4) + 
                    (a.performance.completionRate * 0.3) + 
                    (1 / (a.performance.responseTime + 1) * 0.3);
      const scoreB = (b.performance.averageRating * 0.4) + 
                    (b.performance.completionRate * 0.3) + 
                    (1 / (b.performance.responseTime + 1) * 0.3);
      return scoreB - scoreA;
    });

    res.json(sortedVendors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 