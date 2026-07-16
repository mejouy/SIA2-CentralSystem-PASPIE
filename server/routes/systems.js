const express = require('express');
const router = express.Router();
const System = require('../model/system.model');
const crypto = require('crypto');

// 1. GET all connected systems
router.get('/', async (req, res) => {
  try {
    const systems = await System.find().sort({ createdAt: -1 });
    res.json({ success: true, systems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST register a new system (Auto-generates API Key)
router.post('/', async (req, res) => {
  try {
    const { systemName, contactEmail, status } = req.body;
    
    // Generate a secure, unique API key
    const apiKey = `pk_${crypto.randomBytes(16).toString('hex')}`;

    const newSystem = new System({
      systemName,
      contactEmail,
      apiKey,
      status: status || 'Active'
    });

    await newSystem.save();
    res.status(201).json({ success: true, system: newSystem });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. PUT update system details or status (Toggle Active/Suspended)
router.put('/:id', async (req, res) => {
  try {
    const { systemName, contactEmail, status } = req.body;
    const updatedSystem = await System.findByIdAndUpdate(
      req.params.id,
      { systemName, contactEmail, status },
      { new: true, runValidators: true }
    );

    if (!updatedSystem) {
      return res.status(404).json({ success: false, error: 'System not found' });
    }

    res.json({ success: true, system: updatedSystem });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. DELETE unregister/remove a system
router.delete('/:id', async (req, res) => {
  try {
    const deletedSystem = await System.findByIdAndDelete(req.params.id);
    if (!deletedSystem) {
      return res.status(404).json({ success: false, error: 'System not found' });
    }
    res.json({ success: true, message: 'System removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;