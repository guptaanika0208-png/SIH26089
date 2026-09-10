const express = require('express');
const router = express.Router();
const { registerCooperative, loginCooperative, getCooperativeWorkers } = require('../controllers/cooperativeController');

router.post('/register', registerCooperative);
router.post('/login', loginCooperative);
router.get('/:cooperativeId/workers', getCooperativeWorkers);

module.exports = router;