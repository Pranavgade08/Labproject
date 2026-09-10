const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Setup Multer Storage for file uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'hardwarePhoto' ? 'hw_' : '';
    cb(null, `${prefix}${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Helper function to calculate days
const computeDays = (issue) => {
  const created = new Date(issue.createdAt);
  const updated = new Date(issue.updatedAt || issue.createdAt);
  const now = new Date();
  
  if (issue.status === 'Resolved') {
    const diffTime = Math.abs(updated - created);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } else {
    const diffTime = Math.abs(now - created);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
};

// @route   GET /api/issues
// @desc    Get all issues (Admin: all, Student: own issues)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, lab } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (lab && lab !== 'All') {
      query.lab = lab;
    }

    const issues = await Issue.find(query)
      .populate('student', 'name identifier class rollno year')
      .sort({ createdAt: -1 });

    const formattedIssues = issues.map((issue) => {
      const days = computeDays(issue);
      const isResolved = issue.status === 'Resolved';
      return {
        ...issue.toObject(),
        daysPending: isResolved ? 0 : days,
        daysCompleted: isResolved ? days : 0,
        daysDisplay: days,
      };
    });

    res.json({ success: true, count: formattedIssues.length, data: formattedIssues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/issues/public-recent
// @desc    Get recent issues with photos for public landing page
// @access  Public
router.get('/public-recent', async (req, res) => {
  try {
    const issues = await Issue.find()
      .select('lab systemNumber issueType description photoPath hardwarePhotoPath status createdAt')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/issues/stats
// @desc    Get counts & statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const pendingCount = await Issue.countDocuments({ status: 'Pending' });
    const inProgressCount = await Issue.countDocuments({ status: 'In Progress' });
    const resolvedCount = await Issue.countDocuments({ status: 'Resolved' });
    const totalCount = await Issue.countDocuments();

    res.json({
      success: true,
      stats: {
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        total: totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/issues
// @desc    Create a new lab issue report
// @access  Private (Student)
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'issuePhoto', maxCount: 1 },
    { name: 'hardwarePhoto', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { lab, systemNumber, issueType, description } = req.body;

      if (!lab || !issueType || !description) {
        return res.status(400).json({ success: false, message: 'Please provide lab, issue type and description' });
      }

      let photoPath = null;
      let hardwarePhotoPath = null;

      if (req.files?.issuePhoto?.[0]) {
        photoPath = `/uploads/${req.files.issuePhoto[0].filename}`;
      }
      if (req.files?.hardwarePhoto?.[0]) {
        hardwarePhotoPath = `/uploads/${req.files.hardwarePhoto[0].filename}`;
      }

      const issue = await Issue.create({
        student: req.user.id,
        prn: req.user.identifier,
        lab,
        systemNumber: systemNumber || '',
        issueType,
        description,
        photoPath,
        hardwarePhotoPath,
        status: 'Pending',
      });

      // Create notification for Admin
      await Notification.create({
        title: `New Issue: ${issueType} in ${lab}`,
        message: `${req.user.name} (${req.user.identifier}) reported: ${description.substring(0, 80)}`,
        type: 'issue',
      });

      res.status(201).json({ success: true, message: 'Issue reported successfully!', data: issue });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PATCH /api/issues/:id/status
// @desc    Update status and admin notes for an issue
// @access  Private (Admin / Assistant)
router.patch('/:id/status', protect, authorize('admin', 'assistant'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (status) issue.status = status;
    if (adminNotes !== undefined) issue.adminNotes = adminNotes;
    issue.updatedAt = new Date();

    const days = computeDays(issue);
    if (status === 'Resolved') {
      issue.daysCompleted = days;
      issue.daysPending = 0;
    } else {
      issue.daysPending = days;
    }

    await issue.save();

    res.json({ success: true, message: 'Issue updated successfully', data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/issues/bulk
// @desc    Bulk action on issues (resolve, delete)
// @access  Private (Admin)
router.post('/bulk', protect, authorize('admin'), async (req, res) => {
  try {
    const { action, ids } = req.body;

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid action and issue IDs' });
    }

    if (action === 'resolve') {
      await Issue.updateMany(
        { _id: { $in: ids } },
        { $set: { status: 'Resolved', updatedAt: new Date() } }
      );
      return res.json({ success: true, message: `${ids.length} issue(s) marked as Resolved` });
    } else if (action === 'delete') {
      await Issue.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: `${ids.length} issue(s) deleted successfully` });
    }

    res.status(400).json({ success: false, message: 'Invalid bulk action' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/issues/export-csv
// @desc    Export issues to CSV format
// @access  Private (Admin)
router.get('/export-csv', protect, authorize('admin', 'assistant'), async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('student', 'name identifier class rollno')
      .sort({ createdAt: -1 });

    let csvContent = 'ID,Student Name,PRN,Class,Roll No,Lab,System Number,Issue Type,Description,Status,Days,Date,Admin Notes\n';

    issues.forEach((issue) => {
      const studentName = issue.student ? `"${issue.student.name}"` : '""';
      const studentClass = issue.student?.class ? `"${issue.student.class}"` : '""';
      const rollNo = issue.student?.rollno ? `"${issue.student.rollno}"` : '""';
      const desc = `"${(issue.description || '').replace(/"/g, '""')}"`;
      const notes = `"${(issue.adminNotes || '').replace(/"/g, '""')}"`;
      const days = computeDays(issue);
      const dateStr = new Date(issue.createdAt).toISOString().split('T')[0];

      csvContent += `${issue._id},${studentName},${issue.prn},${studentClass},${rollNo},"${issue.lab}","${issue.systemNumber}","${issue.issueType}",${desc},${issue.status},${days},${dateStr},${notes}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`lab_issues_export_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
