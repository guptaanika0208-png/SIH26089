const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['individual', 'institutional'],
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

  // Individual-specific fields (only used if type === 'individual')
  name: {
    type: String
  },

  // Institutional-specific fields (only used if type === 'institutional')
  organizationName: {
    type: String
  },
  contactPerson: {
    type: String
  },
  registrationNumber: {
    type: String // GST/org registration
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

customerSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Customer', customerSchema);