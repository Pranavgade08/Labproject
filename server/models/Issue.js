const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prn: {
    type: String,
    required: true,
  },
  lab: {
    type: String,
    required: true,
    enum: ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Computer Center', 'Other'],
  },
  systemNumber: {
    type: String,
    trim: true,
    default: '',
  },
  issueType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  photoPath: {
    type: String,
    default: null,
  },
  hardwarePhotoPath: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  daysPending: {
    type: Number,
    default: 0,
  },
  daysCompleted: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

issueSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
