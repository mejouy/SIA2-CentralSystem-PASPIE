const express = require('express');
const router = express.Router();

// Destructure the specific IntegrationLog model out of your combined model file
const { IntegrationLog } = require('../model/dashboard.model'); 

router.get('/city-summary', async (req, res) => {
  try {
    // 1. Fetch total counts
    const totalLogs = await IntegrationLog.countDocuments();
    const successfulLogs = await IntegrationLog.countDocuments({ status: 'SUCCESS' });
    const failedLogs = await IntegrationLog.countDocuments({ status: 'FAILURE' });

    // 2. Calculate system-wide reliability percentage
    const reliabilityRate = totalLogs > 0 ? ((successfulLogs / totalLogs) * 100).toFixed(1) : 100;

    // 3. Fetch recent activity (Crucial for the PDF generator's Log Appendix)
    const recentActivity = await IntegrationLog.find()
      .sort({ timestamp: -1 })
      .limit(40)
      .lean();

    // 4. Aggregate total records, errors, avg payload size, and last active timestamp per subsystem
    const subsystemAggregates = await IntegrationLog.aggregate([
      {
        $group: {
          _id: '$systemName',
          totalSyncs: { $sum: 1 },
          failures: {
            $sum: { $cond: [{ $eq: ['$status', 'FAILURE'] }, 1, 0] }
          },
          lastHeartbeat: { $max: '$timestamp' },
          // Safely calculates average BSON size of the payload object and converts it to KB
          avgPayloadBytes: { 
            $avg: { $cond: [{ $ifNull: ['$payloadReceived', false] }, { $bsonSize: '$payloadReceived' }, 0] } 
          }
        }
      },
      {
        $project: {
          _id: 1,
          totalSyncs: 1,
          failures: 1,
          lastHeartbeat: 1,
          avgPayloadSize: {
            $cond: [
              { $gt: ['$avgPayloadBytes', 0] },
              { $concat: [{ $toString: { $round: [{ $divide: ['$avgPayloadBytes', 1024] }, 1] } }, ' KB'] },
              '0 KB'
            ]
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
      breakdown: subsystemAggregates,
      recentActivity // Sent down to feed the PDF appendix
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;