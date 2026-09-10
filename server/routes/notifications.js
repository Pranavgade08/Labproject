const express = require('express');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get unread notifications
// @access  Private (Admin / Assistant)
router.get('/', protect, authorize('admin', 'assistant'), async (req, res) => {
  try {
    const unread = await Notification.find({ isRead: false }).sort({ createdAt: -1 }).limit(10);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.json({ success: true, count: unreadCount, data: unread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/notifications/mark-read
// @desc    Mark all unread notifications as read
// @access  Private (Admin / Assistant)
router.post('/mark-read', protect, authorize('admin', 'assistant'), async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
