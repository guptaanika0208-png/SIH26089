const express = require('express');
const router = express.Router();
const { createBooking, 
    assignWorker, 
    autoAssignWorker, 
    getWorkerBookings, 
    getCustomerBookings, 
    getCooperativeBookings, 
    completeBooking, 
    rateBooking,
    getDemandStats} = require('../controllers/bookingController');

router.post('/create', createBooking);
router.patch('/:bookingId/assign', assignWorker);
router.patch('/:bookingId/auto-assign', autoAssignWorker);
router.get('/worker/:workerId', getWorkerBookings);
router.get('/customer/:customerId', getCustomerBookings);
router.get('/cooperative/:cooperativeId', getCooperativeBookings);
router.patch('/:bookingId/complete', completeBooking);
router.patch('/:bookingId/rate', rateBooking);
router.get('/demand/:cooperativeId', getDemandStats);

module.exports = router;