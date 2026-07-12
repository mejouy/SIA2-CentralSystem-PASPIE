const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Complaints subsystem route is ready.' });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Complaints data received.' });
});

module.exports = router;
