const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Announcements subsystem route is ready.' });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Announcements data received.' });
});

module.exports = router;
