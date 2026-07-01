const express = require('express');
const router = express.Router();
const { SystemStatus, IntegrationLog } = require('../model/dashboard.model');

// POST: Ingest data from member systems
router.post('/ingest/:systemName', async (req, res) => {
  const { systemName } = req.params;
  const payload = req.body;

  const validSystems = ['Announcements', 'LostAndFound', 'Complaints', 'FacilityReservation'];
  if (!validSystems.includes(systemName)) {
    return res.status(400).json({ success: false, message: 'Unknown member subsystem.' });
  }

  try {
    const incrementCount = payload.recordCount || 1;

    await SystemStatus.findOneAndUpdate(
      { systemName },
      {
        isOnline: true,
        lastHeartbeat: new Date(),
        $inc: { totalRecordsCount: incrementCount },
        $set: { summaryMetrics: payload.summaryData || {} }
      },
      { upsert: true, new: true }
    );

    await IntegrationLog.create({
      systemName,
      endpoint: `/api/integration/ingest/${systemName}`,
      status: 'SUCCESS',
      payloadReceived: payload
    });

    res.status(200).json({ success: true, message: 'Metrics aggregated safely.' });
  } catch (error) {
    await IntegrationLog.create({
      systemName,
      endpoint: `/api/integration/ingest/${systemName}`,
      status: 'FAILURE',
      payloadReceived: payload,
      errorMessage: error.message
    });
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Fetch stats for your MUI frontend
router.get('/summary', async (req, res) => {
  try {
    const systems = await SystemStatus.find({});
    const logs = await IntegrationLog.find().sort({ timestamp: -1 }).limit(10);
    res.status(200).json({ success: true, systems, recentActivity: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;