const express = require('express');
const router = express.Router();
const { createBooking, assignWorker, autoAssignWorker } = require('../controllers/bookingController');

router.post('/create', createBooking);
router.patch('/:bookingId/assign', assignWorker);  //manual
router.patch('/:bookingId/auto-assign', autoAssignWorker);

module.exports = router;