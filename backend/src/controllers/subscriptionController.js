const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const Cooperative = require('../models/Cooperative');

const createSubscription = async (req, res) => {
  try {
    const {
      customer,
      cooperative,
      serviceType,
      contractType,
      frequency,
      workersRequired,
      startDate,
      endDate,
      location,
      price
    } = req.body;

    const existingCustomer = await Customer.findById(customer);
    if (!existingCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const existingCooperative = await Cooperative.findById(cooperative);
    if (!existingCooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }

    const subscription = await Subscription.create({
      customer,
      cooperative,
      serviceType,
      contractType,
      frequency,
      workersRequired: workersRequired || 1,
      startDate,
      endDate,
      location,
      price,
      status: 'active'
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createSubscription };