const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Lost & Found subsystem route is ready.' });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Lost & Found data received.' });
});

module.exports = router;
