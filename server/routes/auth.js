const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Computer = require('../models/Computer');
const UserSession = require('../models/UserSession');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'labtrack_super_secret_jwt_key_2026_modern', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new student
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, prn, password, class: studentClass, rollno, year } = req.body;

    if (!name || !prn || !password || !studentClass || !rollno || !year) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const cleanPrn = prn.trim().toUpperCase();

    const existingUser = await User.findOne({ identifier: cleanPrn });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'PRN already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      identifier: cleanPrn,
      password,
      role: 'student',
      class: studentClass,
      rollno: rollno.trim(),
      year,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Signup successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        prn: user.identifier,
        role: user.role,
        class: user.class,
        rollno: user.rollno,
        year: user.year,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/student-login
// @desc    Authenticate student & start session
// @access  Public
router.post('/student-login', async (req, res) => {
  try {
    const { prn, password } = req.body;

    if (!prn || !password) {
      return res.status(400).json({ success: false, message: 'Please provide PRN and password' });
    }

    const cleanPrn = prn.trim().toUpperCase();
    const user = await User.findOne({ identifier: cleanPrn, role: 'student' });

    if (!user) {
      return res.status(401).json({ success: false, message: 'PRN not registered' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }

    // Identify client IP and computer if registered
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const computer = await Computer.findOne({ ipAddress: clientIp });

    // Record login session
    const session = await UserSession.create({
      student: user._id,
      studentPrn: user.identifier,
      computer: computer ? computer._id : null,
      ipAddress: clientIp,
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      sessionId: session._id,
      user: {
        id: user._id,
        name: user.name,
        prn: user.identifier,
        role: user.role,
        class: user.class,
        rollno: user.rollno,
        year: user.year,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/admin-login
// @desc    Authenticate Admin or Assistant
// @access  Public
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const cleanUsername = username.trim();
    const user = await User.findOne({
      identifier: cleanUsername,
      role: { $in: ['admin', 'assistant'] },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.identifier,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user details
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout student and mark session completion
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      await UserSession.findByIdAndUpdate(sessionId, { logoutTime: new Date() });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password for student or admin
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all password fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
