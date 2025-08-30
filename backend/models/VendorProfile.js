const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  categories: [{
    type: String,
    enum: ['Catering', 'Photography', 'Decoration', 'Music', 'Makeup', 'Venue', 'Other'],
    required: true
  }],
  portfolio: {
    images: [{
      url: String,
      caption: String,
      category: String
    }],
    videos: [{
      url: String,
      caption: String,
      category: String
    }],
    testimonials: [{
      clientName: String,
      eventType: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      date: Date
    }]
  },
  availability: {
    schedule: [{
      date: Date,
      status: {
        type: String,
        enum: ['available', 'booked', 'unavailable'],
        default: 'available'
      },
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      }
    }],
    workingHours: {
      start: String,
      end: String
    },
    advanceBookingDays: {
      type: Number,
      default: 30
    }
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    duration: String,
    category: String
  }],
  performance: {
    totalEvents: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number, // in minutes
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    email: String,
    phone: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  documents: [{
    type: String,
    name: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
vendorProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VendorProfile', vendorProfileSchema); 