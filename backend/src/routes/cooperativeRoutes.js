const express = require('express');
const router = express.Router();
const { registerCooperative, loginCooperative } = require('../controllers/cooperativeController');

router.post('/register', registerCooperative);
router.post('/login', loginCooperative);

module.exports = router;