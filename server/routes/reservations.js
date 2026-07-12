const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Reservations subsystem route is ready.' });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Reservations data received.' });
});

module.exports = router;
