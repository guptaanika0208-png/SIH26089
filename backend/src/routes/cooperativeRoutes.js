const express = require('express');
const router = express.Router();
const {
  registerCooperative,
  loginCooperative,
  getCooperativeWorkers,
  getWorkerById,
  listCooperatives,
  verifyWorker
} = require('../controllers/cooperativeController');

router.post('/register', registerCooperative);
router.post('/login', loginCooperative);
router.get('/list', listCooperatives);
router.get('/:cooperativeId/workers', getCooperativeWorkers);
router.get('/worker/:workerId', getWorkerById);
router.patch('/worker/:workerId/verify', verifyWorker);

module.exports = router;