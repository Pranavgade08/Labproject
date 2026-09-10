const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  studentPrn: {
    type: String,
    required: true,
  },
  computer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Computer',
  },
  ipAddress: {
    type: String,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
  logoutTime: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('UserSession', userSessionSchema);
