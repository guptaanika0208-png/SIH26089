const express = require('express');
const router = express.Router();
const { registerCooperative } = require('../controllers/cooperativeController');

router.post('/register', registerCooperative);

module.exports = router;