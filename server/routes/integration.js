const express = require('express');
const router = express.Router();
const { SystemStatus, IntegrationLog } = require('../model/dashboard.model');
const CentralSubsystemRecord = require('../model/central-data.model');

const VALID_SYSTEMS = ['Announcements', 'LostAndFound', 'Complaints', 'FacilityReservation'];

function isAllowedSubsystem(systemName) {
  return VALID_SYSTEMS.includes(systemName);
}

// POST: Ingest data from member systems
router.post('/ingest/:systemName', async (req, res) => {
  const { systemName } = req.params;
  const payload = req.body;

  if (!isAllowedSubsystem(systemName)) {
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

    await CentralSubsystemRecord.create({
      systemName,
      recordType: payload.recordType || 'integration',
      scope: payload.scope || 'private',
      payload: payload.recordData || payload.summaryData || payload
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

// GET: Return only the records for one subsystem from the central database
router.get('/subsystem/:systemName', async (req, res) => {
  const { systemName } = req.params;

  if (!isAllowedSubsystem(systemName)) {
    return res.status(403).json({ success: false, message: 'Access denied for this subsystem.' });
  }

  try {
    const records = await CentralSubsystemRecord.find({ systemName }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, systemName, records, count: records.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Fetch all integration logs (for the dedicated Integration Logs UI table)
router.get('/logs', async (req, res) => {
  try {
    const { status, systemName } = req.query;
    let query = {};

    // Optional filters for your UI dropdowns
    if (status) query.status = status; // e.g., SUCCESS or FAILURE
    if (systemName) query.systemName = systemName;

    const logs = await IntegrationLog.find(query)
      .sort({ timestamp: -1 }) // Newest first
      .lean();

    res.status(200).json({ 
      success: true, 
      count: logs.length, 
      logs 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Fetch all synced transactions from all subsystems
router.get('/transactions', async (req, res) => {
  try {
    const { systemName } = req.query;
    let query = {};

    if (systemName && systemName !== 'ALL') {
      query.systemName = systemName;
    }

    const transactions = await CentralSubsystemRecord.find(query)
      .sort({ createdAt: -1 }) // Newest transactions first
      .lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Clear all logs (highly useful utility for testing/clean slate)
router.delete('/logs/clear', async (req, res) => {
  try {
    await IntegrationLog.deleteMany({});
    res.status(200).json({ success: true, message: 'All integration logs cleared successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;