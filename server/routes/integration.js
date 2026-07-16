const express = require('express');
const router = express.Router();
const { SystemStatus, IntegrationLog } = require('../model/dashboard.model');
const CentralSubsystemRecord = require('../model/central-data.model');
const System = require('../model/system.model'); // Links to your new User Management model

// Helper function to dynamically check if a system is registered
async function isRegisteredSubsystem(systemName) {
  const system = await System.findOne({ systemName });
  return !!system;
}

// POST: Ingest data from member systems (Secured with API Key Verification)
router.post('/ingest/:systemName', async (req, res) => {
  const { systemName } = req.params;
  const payload = req.body;
  const apiKey = req.headers['x-api-key'];

  try {
    // 1. Authenticate using the User Management system registry
    const activeSystem = await System.findOne({ systemName, apiKey, status: 'Active' });
    
    if (!activeSystem) {
      // Log the unauthorized attempt for security monitoring
      await IntegrationLog.create({
        systemName,
        endpoint: `/api/integration/ingest/${systemName}`,
        status: 'FAILURE',
        payloadReceived: payload,
        errorMessage: 'Unauthorized: Invalid API key or suspended system status.'
      });
      
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Invalid API key or inactive subsystem status.' 
      });
    }

    // 2. Process data updates if authenticated
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

// GET: Fetch stats for your MUI frontend dashboard
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

  try {
    const systemExists = await isRegisteredSubsystem(systemName);
    if (!systemExists) {
      return res.status(404).json({ success: false, message: 'Subsystem registry not found.' });
    }

    const records = await CentralSubsystemRecord.find({ systemName }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, systemName, records, count: records.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Fetch all integration logs (Satisfies: Integration Logs UI requirement)
router.get('/logs', async (req, res) => {
  try {
    const { status, systemName } = req.query;
    let query = {};

    if (status) query.status = status; 
    if (systemName) query.systemName = systemName;

    const logs = await IntegrationLog.find(query).sort({ timestamp: -1 }).lean();

    res.status(200).json({ 
      success: true, 
      count: logs.length, 
      logs 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Fetch all synced transactions (Satisfies: Transaction Monitoring UI requirement)
router.get('/transactions', async (req, res) => {
  try {
    const { systemName } = req.query;
    let query = {};

    if (systemName && systemName !== 'ALL') {
      query.systemName = systemName;
    }

    const transactions = await CentralSubsystemRecord.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Clear all logs for maintenance/testing
router.delete('/logs/clear', async (req, res) => {
  try {
    await IntegrationLog.deleteMany({});
    res.status(200).json({ success: true, message: 'All integration logs cleared successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;