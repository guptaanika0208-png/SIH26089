const Worker = require('../models/Worker');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new worker
const registerWorker = async (req, res) => {
  try {
    const { name, email, password, phone, cooperative, skills, location } = req.body;

    // check if worker already exists
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ message: 'Worker already registered with this email' });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const worker = await Worker.create({
      name,
      email,
      password: hashedPassword,
      phone,
      cooperative,
      skills,
      location
    });

    res.status(201).json({
      message: 'Worker registered successfully',
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;

    const worker = await Worker.findOne({ email });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const isMatch = await bcrypt.compare(password, worker.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: worker._id, role: 'worker' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        rating: worker.rating
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerWorker, loginWorker };
