const express = require('express');
const router = express.Router();
const { createBooking, assignWorker } = require('../controllers/bookingController');

router.post('/create', createBooking);
router.patch('/:bookingId/assign', assignWorker);

module.exports = router;