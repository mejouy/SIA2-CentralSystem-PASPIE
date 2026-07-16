const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
  systemName: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  apiKey: { 
    type: String, 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Suspended', 'Maintenance'], 
    default: 'Active' 
  },
  contactEmail: { 
    type: String, 
    required: true,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('System', systemSchema);