const express = require('express');
const router = express.Router();
const Admin = require('../model/admin.model');
const jwt = require('jsonwebtoken');

// Secret key for JWT (In production, move this to your .env file!)
const JWT_SECRET = 'SMART_CITY_SUPER_SECRET_KEY';

// 1. ADMIN REGISTRATION (Use this once to create your account)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin email already registered.' });
    }

    const newAdmin = new Admin({ email, password, name });
    await newAdmin.save();

    res.status(201).json({ success: true, message: 'Admin account created successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. ADMIN LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check password match
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, name: admin.name }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      admin: { name: admin.name, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;