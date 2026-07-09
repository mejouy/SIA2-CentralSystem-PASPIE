const mongoose = require('mongoose');

const CentralSubsystemRecordSchema = new mongoose.Schema({
  systemName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  recordType: {
    type: String,
    default: 'generic'
  },
  scope: {
    type: String,
    default: 'private'
  },
  payload: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('CentralSubsystemRecord', CentralSubsystemRecordSchema);
