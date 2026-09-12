const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const Cooperative = require('../models/Cooperative');
const Worker = require('../models/Worker');

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

const getCustomerSubscriptions = async (req, res) => {
  try {
    const { customerId } = req.params;
    const subscriptions = await Subscription.find({ customer: customerId });
    res.status(200).json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCooperativeSubscriptions = async (req, res) => {
  try {
    const { cooperativeId } = req.params;
    const subscriptions = await Subscription.find({ cooperative: cooperativeId })
      .populate('customer', 'name organizationName email')
      .populate('assignedWorkers.worker', 'name skills rating');
    res.status(200).json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'paused', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    subscription.status = status;
    await subscription.save();

    res.status(200).json({ message: 'Subscription status updated', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const assignWorkerToSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { workerId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    // mark any currently active assignment as no longer active (handles both first-time
    // assignment and future replacements through the same function)
    subscription.assignedWorkers.forEach((a) => { a.isActive = false; });
    subscription.assignedWorkers.push({ worker: workerId, isActive: true });

    await subscription.save();
    await subscription.populate('assignedWorkers.worker', 'name skills rating');

    res.status(200).json({ message: 'Worker assigned to subscription', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createSubscription, getCustomerSubscriptions, getCooperativeSubscriptions,updateSubscriptionStatus, assignWorkerToSubscription };
