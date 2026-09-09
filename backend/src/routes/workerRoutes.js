const express = require('express');
const router = express.Router();
const { registerWorker, loginWorker } = require('../controllers/workerController');

router.post('/register', registerWorker);
router.post('/login', loginWorker);

module.exports = router;