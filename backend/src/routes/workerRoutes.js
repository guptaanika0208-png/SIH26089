const express = require('express');
const router = express.Router();
const { registerWorker } = require('../controllers/workerController');

router.post('/register', registerWorker);

module.exports = router;