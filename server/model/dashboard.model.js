const mongoose = require('mongoose');

const SystemStatusSchema = new mongoose.Schema({
  systemName: { type: String, required: true, unique: true },
  isOnline: { type: Boolean, default: true },
  lastHeartbeat: { type: Date, default: Date.now },
  totalRecordsCount: { type: Number, default: 0 },
  summaryMetrics: { type: Object, default: {} } 
}, { timestamps: true });

const IntegrationLogSchema = new mongoose.Schema({
  systemName: { type: String, required: true },
  endpoint: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILURE'], required: true },
  payloadReceived: { type: Object },
  errorMessage: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  SystemStatus: mongoose.model('SystemStatus', SystemStatusSchema),
  IntegrationLog: mongoose.model('IntegrationLog', IntegrationLogSchema)
};