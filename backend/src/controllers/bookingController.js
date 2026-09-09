const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Cooperative = require('../models/Cooperative');
const Worker = require('../models/Worker');

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

module.exports = { createBooking, assignWorker };