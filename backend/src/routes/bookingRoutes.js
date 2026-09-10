const express = require('express');
const router = express.Router();
const { createBooking, assignWorker, autoAssignWorker, getWorkerBookings, getCustomerBookings, getCooperativeBookings} = require('../controllers/bookingController');

router.post('/create', createBooking);
router.patch('/:bookingId/assign', assignWorker);
router.patch('/:bookingId/auto-assign', autoAssignWorker);
router.get('/worker/:workerId', getWorkerBookings);
router.get('/customer/:customerId', getCustomerBookings);
router.get('/cooperative/:cooperativeId', getCooperativeBookings);

module.exports = router;