const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true // hashed with bcrypt before saving
  },
  phone: {
    type: String,
    required: true
  },

  cooperative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    required: true
  },

  skills: [{
    type: String, // e.g. 'plumbing', 'cleaning', 'elder care'
    required: true
  }],

  certifications: [{
    name: String,
    issuedBy: String,
    fileUrl: String, // link to uploaded certificate
    verified: {
      type: Boolean,
      default: false
    }
  }],

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

  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },

  // used by the allocation engine for fair distribution
  currentWorkload: {
    type: Number,
    default: 0 // number of active jobs/subscriptions right now
  },
  utilizationScore: {
    type: Number,
    default: 0 // e.g. % of capacity used, updated as jobs are assigned/completed
  },

  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },

  earnings: {
    total: {
      type: Number,
      default: 0
    }
  },

  isVerified: {
    type: Boolean,
    default: false // cooperative marks this true after checking certs
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

workerSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Worker', workerSchema);