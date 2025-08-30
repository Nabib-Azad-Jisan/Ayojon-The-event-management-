const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get messages for a specific event and vendor
router.get('/:eventId/:vendorId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      event: req.params.eventId,
      vendor: req.params.vendorId,
    })
      .populate('sender', 'name avatar')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const message = new Message({
      event: req.body.event,
      vendor: req.body.vendor,
      sender: req.user._id,
      content: req.body.content,
      timestamp: req.body.timestamp,
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get all conversations for the logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    // Find all users this user has messaged with
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId },
        { receiver: req.user.userId }
      ]
    }).sort({ timestamp: -1 });

    // Get unique user IDs from conversations
    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== req.user.userId) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== req.user.userId) userIds.add(msg.receiver.toString());
    });
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
});

// Get conversation (thread) with a specific user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.userId }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
});

// Mark a message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.receiver.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    message.read = true;
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error marking as read', error: error.message });
  }
});

module.exports = router; 