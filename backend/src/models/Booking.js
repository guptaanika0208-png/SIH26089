const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },

  cooperative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    required: true
  },

  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    default: null // null until the allocation engine (or admin) assigns one
  },

  serviceType: {
    type: String,
    required: true // e.g. 'cleaning', 'plumbing', 'elder care'
  },

  isEmergency: {
    type: Boolean,
    default: false
  },

  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },

  scheduledDate: {
    type: Date,
    required: true
  },

  scheduledTime: {
    type: String // e.g. '10:00 AM' — simple string for now
  },

  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },

  price: {
    type: Number,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },

  rating: {
    score: {
      type: Number, // 1-5
      default: null
    },
    review: {
      type: String,
      default: ''
    }
  },

  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null // linked if this booking was auto-generated from a subscription
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);