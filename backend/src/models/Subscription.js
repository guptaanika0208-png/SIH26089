const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
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

  serviceType: {
    type: String,
    required: true // e.g. 'cleaning', 'elder care', 'gardening'
  },

  // for individual customers: e.g. weekly cleaning
  // for institutional customers: e.g. 6-month workforce requirement
  contractType: {
    type: String,
    enum: ['recurring', 'fixed-term'],
    required: true
  },

  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'one-time-term'],
    required: true
  },

  assignedWorkers: [{
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true // false if this worker was replaced
    }
  }],

  workersRequired: {
    type: Number,
    default: 1 // institutional contracts may need multiple workers
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date // null/empty for ongoing recurring subscriptions
  },

  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },

  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },

  price: {
    amount: Number,
    billingCycle: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly'
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

subscriptionSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Subscription', subscriptionSchema);