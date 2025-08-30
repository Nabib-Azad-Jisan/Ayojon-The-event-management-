const express = require('express');
const router = express.Router();
const VendorRequest = require('../models/VendorRequest');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get all vendor requests for a vendor
router.get('/requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const requests = await VendorRequest.find({ vendor: req.user.userId })
      .populate('event', 'title date location');
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a vendor request
router.post('/requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { eventId, requirementId, category, proposal, price } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if requirement exists and is open
    const requirement = event.vendorRequirements.id(requirementId);
    if (!requirement || requirement.status !== 'open') {
      return res.status(404).json({ message: 'Requirement not found or not open' });
    }

    const vendorRequest = new VendorRequest({
      vendor: req.user.userId,
      event: eventId,
      requirementId: requirementId,
      category,
      proposal,
      price
    });

    await vendorRequest.save();
    res.status(201).json(vendorRequest);
  } catch (error) {
    console.error('Error submitting vendor request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update vendor request status
router.put('/requests/:id', auth, async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the event organizer
    const event = await Event.findById(request.event);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the event organizer
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedRequest = await VendorRequest.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    ).populate('vendor', 'name email');

    // If request is approved, update the event's vendor requirements
    if (req.body.status === 'approved') {
      await Event.updateOne(
        { 'vendorRequirements._id': request.requirementId },
        {
          $set: {
            'vendorRequirements.$.status': 'assigned',
            'vendorRequirements.$.assignedVendor': request.vendor
          }
        }
      );
      // Send notification to the vendor
      await Notification.create({
        user: request.vendor,
        message: `Your proposal for the event '${event.title}' has been approved!`,
      });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit a vendor proposal (only if pending and owner)
router.put('/requests/:id', auth, async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.vendor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit a non-pending proposal' });
    }
    request.proposal = req.body.proposal;
    request.price = req.body.price;
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Withdraw (delete) a vendor proposal (only if pending and owner)
router.delete('/requests/:id', auth, async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.vendor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw a non-pending proposal' });
    }
    await request.remove();
    res.json({ message: 'Proposal withdrawn' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all vendors (for admin dashboard)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all open requirements from all events
router.get('/open-requirements', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find all events that have at least one open requirement
    const events = await Event.find({
      'vendorRequirements.status': 'open',
      status: { $ne: 'cancelled' } // Don't show cancelled events
    })
    .populate('organizer', 'name email')
    .sort({ date: 1 }); // Sort by date

    // Flatten requirements with event info
    const openRequirements = [];
    events.forEach(event => {
      event.vendorRequirements.forEach(req => {
        if (req.status === 'open') {
          openRequirements.push({
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            organizer: event.organizer,
            requirementId: req._id,
            category: req.category,
            description: req.description,
            budget: req.budget,
            status: req.status
          });
        }
      });
    });

    console.log('Found open requirements:', openRequirements.length);
    res.json(openRequirements);
  } catch (error) {
    console.error('Error fetching open requirements:', error);
    res.status(500).json({ 
      message: 'Error fetching open requirements', 
      error: error.message 
    });
  }
});

// Get notifications for the logged-in vendor
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Get vendor statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const vendorId = req.user.userId;

    // Get all proposals for this vendor
    const proposals = await VendorRequest.find({ vendor: vendorId });

    // Calculate statistics
    const stats = {
      totalProposals: proposals.length,
      approvedProposals: proposals.filter(p => p.status === 'approved').length,
      pendingProposals: proposals.filter(p => p.status === 'pending').length,
      rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
      totalEarnings: proposals
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + (p.price || 0), 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({ 
      message: 'Error fetching vendor statistics', 
      error: error.message 
    });
  }
});

module.exports = router; 