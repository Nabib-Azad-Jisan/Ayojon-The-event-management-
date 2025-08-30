const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['wedding', 'mehendi', 'birthday', 'corporate', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  images: [{
    type: String
  }],
  vendorRequirements: [{
    category: {
      type: String,
      enum: ['Catering', 'Photography', 'Decoration', 'Music', 'Makeup', 'Other']
    },
    description: String,
    budget: Number,
    status: {
      type: String,
      enum: ['open', 'assigned', 'completed'],
      default: 'open'
    },
    assignedVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  budget: {
    type: Number
  },
  guestCount: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema); 