const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Cooperative = require('../models/Cooperative');
const Worker = require('../models/Worker');
const { findBestWorker } = require('../services/allocationEngine');

const PLATFORM_FEE_PERCENT = 0.15; // cooperative/platform takes 15%, worker keeps 85%

const createBooking = async (req, res) => {
  try {
    const {
      customer,
      cooperative,
      serviceType,
      isEmergency,
      location,
      scheduledDate,
      scheduledTime,
      price
    } = req.body;

    // verify customer exists
    const existingCustomer = await Customer.findById(customer);
    if (!existingCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // verify cooperative exists
    const existingCooperative = await Cooperative.findById(cooperative);
    if (!existingCooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }

    const booking = await Booking.create({
      customer,
      cooperative,
      serviceType,
      isEmergency: isEmergency || false,
      location,
      scheduledDate,
      scheduledTime,
      price,
      status: 'pending' // worker not yet assigned
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Manually assign a worker to a booking
const assignWorker = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { workerId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // update the booking
    booking.worker = workerId;
    booking.status = 'assigned';
    await booking.save();

    // update the worker's workload
    worker.currentWorkload += 1;
    await worker.save();

    res.status(200).json({
      message: 'Worker assigned successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// AI-based auto-assignment — findBestWorker internally applies distance-priority
// scoring when booking.isEmergency is true, otherwise uses the normal weighted formula
const autoAssignWorker = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const result = await findBestWorker(booking);
    if (!result) {
      return res.status(404).json({ message: 'No eligible worker found for this booking' });
    }

    const { worker, distance, totalScore } = result;

    booking.worker = worker._id;
    booking.status = 'assigned';
    await booking.save();

    worker.currentWorkload += 1;
    await worker.save();

    res.status(200).json({
      message: 'Worker auto-assigned successfully',
      booking,
      matchDetails: {
        workerName: worker.name,
        distanceKm: distance.toFixed(2),
        matchScore: totalScore.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getWorkerBookings = async (req, res) => {
  try {
    const { workerId } = req.params;
    const bookings = await Booking.find({ worker: workerId }).populate('customer', 'name organizationName email');
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;
    const bookings = await Booking.find({ customer: customerId }).populate('worker', 'name phone rating');
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCooperativeBookings = async (req, res) => {
  try {
    const { cooperativeId } = req.params;
    const bookings = await Booking.find({ cooperative: cooperativeId })
      .populate('customer', 'name organizationName email')
      .populate('worker', 'name phone');
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Marks a booking complete and splits the payment: platform fee stays with the
// cooperative, the rest is added to the worker's total earnings — stored on the
// booking itself (earningsBreakdown) so the split is transparent and auditable.
const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'completed';

    const platformFee = Math.round(booking.price * PLATFORM_FEE_PERCENT);
    const workerEarning = booking.price - platformFee;
    booking.earningsBreakdown = { platformFee, workerEarning };

    await booking.save();

    // free up the worker's workload and credit their earnings
    if (booking.worker) {
      const worker = await Worker.findById(booking.worker);
      if (worker) {
        if (worker.currentWorkload > 0) worker.currentWorkload -= 1;
        worker.earnings.total = (worker.earnings.total || 0) + workerEarning;
        await worker.save();
      }
    }

    res.status(200).json({ message: 'Booking marked as completed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const rateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { score, review } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    booking.rating = { score, review: review || '' };
    await booking.save();

    if (booking.worker) {
      const worker = await Worker.findById(booking.worker);
      if (worker) {
        const newCount = worker.rating.count + 1;
        const newAverage = ((worker.rating.average * worker.rating.count) + score) / newCount;
        worker.rating.average = newAverage;
        worker.rating.count = newCount;
        await worker.save();
      }
    }

    res.status(200).json({ message: 'Rating submitted successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDemandStats = async (req, res) => {
  try {
    const { cooperativeId } = req.params;

    const byService = await Booking.aggregate([
      { $match: { cooperative: new (require('mongoose').Types.ObjectId)(cooperativeId) } },
      { $group: { _id: '$serviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byCity = await Booking.aggregate([
      { $match: { cooperative: new (require('mongoose').Types.ObjectId)(cooperativeId) } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({ byService, byCity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  assignWorker,
  autoAssignWorker,
  getWorkerBookings,
  getCustomerBookings,
  getCooperativeBookings,
  completeBooking,
  rateBooking,
  getDemandStats
};