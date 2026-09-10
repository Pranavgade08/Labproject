const mongoose = require('mongoose');

const computerSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Unknown Host',
    trim: true,
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true,
  },
  macAddress: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  labNumber: {
    type: String,
    default: 'Unassigned',
    trim: true,
  },
  os: {
    type: String,
    default: 'Windows',
  },
  status: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Online',
  },
  installedSoftware: [
    {
      name: String,
      version: String,
    },
  ],
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Computer', computerSchema);
