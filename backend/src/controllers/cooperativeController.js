const Cooperative = require('../models/Cooperative');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerCooperative = async (req, res) => {
  try {
    const { name, registrationNumber, adminEmail, password, location, contactPhone } = req.body;

    const existing = await Cooperative.findOne({ adminEmail });
    if (existing) {
      return res.status(400).json({ message: 'Cooperative already registered with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const cooperative = await Cooperative.create({
      name,
      registrationNumber,
      adminEmail,
      password: hashedPassword,
      location,
      contactPhone
    });

    res.status(201).json({
      message: 'Cooperative registered successfully',
      cooperative: {
        id: cooperative._id,
        name: cooperative.name,
        adminEmail: cooperative.adminEmail
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginCooperative = async (req, res) => {
  try {
    const { adminEmail, password } = req.body;

    const cooperative = await Cooperative.findOne({ adminEmail });
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }

    const isMatch = await bcrypt.compare(password, cooperative.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: cooperative._id, role: 'cooperative' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      cooperative: {
        id: cooperative._id,
        name: cooperative.name,
        adminEmail: cooperative.adminEmail
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerCooperative, loginCooperative };
