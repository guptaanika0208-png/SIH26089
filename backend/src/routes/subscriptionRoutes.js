const express = require('express');
const router = express.Router();
const { createSubscription, getCustomerSubscriptions, getCooperativeSubscriptions } = require('../controllers/subscriptionController');

router.get('/cooperative/:cooperativeId', getCooperativeSubscriptions);
router.get('/customer/:customerId', getCustomerSubscriptions);
router.post('/create', createSubscription);

module.exports = router;