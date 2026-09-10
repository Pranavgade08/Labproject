const express = require('express');
const Issue = require('../models/Issue');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/monthly
// @desc    Get monthly analytics & report metrics
// @access  Private (Admin / Assistant)
router.get('/monthly', protect, authorize('admin', 'assistant'), async (req, res) => {
  try {
    const monthQuery = req.query.month || new Date().toISOString().substring(0, 7); // e.g. "2026-09"
    const [year, month] = monthQuery.split('-').map(Number);

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const issues = await Issue.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate('student', 'name identifier class rollno')
      .sort({ createdAt: -1 });

    const totalCount = issues.length;
    let pendingCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let totalResolutionDays = 0;
    let resolvedWithDaysCount = 0;

    const labDistribution = {};
    const typeDistribution = {};

    issues.forEach((issue) => {
      // Status counts
      if (issue.status === 'Pending') pendingCount++;
      else if (issue.status === 'In Progress') inProgressCount++;
      else if (issue.status === 'Resolved') {
        resolvedCount++;
        const created = new Date(issue.createdAt);
        const updated = new Date(issue.updatedAt || issue.createdAt);
        const diffDays = Math.max(0, Math.floor((updated - created) / (1000 * 60 * 60 * 24)));
        totalResolutionDays += diffDays;
        resolvedWithDaysCount++;
      }

      // Lab distribution
      const labName = issue.lab || 'Unassigned';
      labDistribution[labName] = (labDistribution[labName] || 0) + 1;

      // Type distribution
      const typeName = issue.issueType || 'Other';
      typeDistribution[typeName] = (typeDistribution[typeName] || 0) + 1;
    });

    const avgResolution = resolvedWithDaysCount > 0
      ? (totalResolutionDays / resolvedWithDaysCount).toFixed(1)
      : 0;

    res.json({
      success: true,
      month: monthQuery,
      summary: {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        avgResolutionDays: parseFloat(avgResolution),
      },
      labDistribution: Object.entries(labDistribution).map(([lab, count]) => ({ lab, count })),
      typeDistribution: Object.entries(typeDistribution).map(([type, count]) => ({ type, count })),
      issues,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
