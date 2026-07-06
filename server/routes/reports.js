const express = require('express');
const router = express.Router();

// Destructure the specific IntegrationLog model out of your combined model file
const { IntegrationLog } = require('../model/dashboard.model'); 

router.get('/city-summary', async (req, res) => {
  try {
    // 1. Fetch total counts (Updated 'FAILED' to 'FAILURE' to match schema enum definition)
    const totalLogs = await IntegrationLog.countDocuments();
    const successfulLogs = await IntegrationLog.countDocuments({ status: 'SUCCESS' });
    const failedLogs = await IntegrationLog.countDocuments({ status: 'FAILURE' });

    // 2. Calculate system-wide reliability percentage
    const reliabilityRate = totalLogs > 0 ? ((successfulLogs / totalLogs) * 100).toFixed(1) : 100;

    // 3. Aggregate total records captured broken down by subsystem
    const subsystemAggregates = await IntegrationLog.aggregate([
      {
        $group: {
          _id: '$systemName',
          totalSyncs: { $sum: 1 },
          failures: {
            // Evaluates conditional matches strictly against the 'FAILURE' identifier
            $sum: { $cond: [{ $eq: ['$status', 'FAILURE'] }, 1, 0] }
          }
        }
      }
    ]);

    // Send uniform clean layout data payload back to frontend admin interface
    res.json({
      success: true,
      generatedAt: new Date(),
      metrics: {
        totalLogs,
        successfulLogs,
        failedLogs,
        reliabilityRate: `${reliabilityRate}%`
      },
      breakdown: subsystemAggregates
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;