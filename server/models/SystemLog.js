const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  computer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Computer',
  },
  macAddress: {
    type: String,
    trim: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: ['startup', 'shutdown', 'heartbeat', 'error', 'software_report', 'remote_action'],
  },
  details: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SystemLog', systemLogSchema);
