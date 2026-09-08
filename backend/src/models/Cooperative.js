const mongoose = require('mongoose');

const cooperativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  adminEmail: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true // will be hashed with bcrypt before saving
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
  contactPhone: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

cooperativeSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Cooperative', cooperativeSchema);