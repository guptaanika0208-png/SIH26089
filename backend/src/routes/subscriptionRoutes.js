const express = require('express');
const router = express.Router();
const { createSubscription, getCustomerSubscriptions, getCooperativeSubscriptions,updateSubscriptionStatus,assignWorkerToSubscription } = require('../controllers/subscriptionController');

router.get('/cooperative/:cooperativeId', getCooperativeSubscriptions);
router.get('/customer/:customerId', getCustomerSubscriptions);
router.post('/create', createSubscription);
router.patch('/:subscriptionId/status', updateSubscriptionStatus);
router.patch('/:subscriptionId/assign-worker', assignWorkerToSubscription);

module.exports = router;