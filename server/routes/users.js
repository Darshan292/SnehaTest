const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Question = require('../models/Question');
const Response = require('../models/Response');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Get user's recent questions
    const recentQuestions = await Question.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status credits createdAt');

    // Get user's recent responses
    const recentResponses = await Response.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('question', 'title')
      .select('content isHelpful createdAt question');

    res.json({
      user,
      recentQuestions,
      recentResponses
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, email, bio } = req.body;
    const updateFields = {};

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updateFields.username = username;
    }

    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      updateFields.email = email;
    }

    if (bio !== undefined) {
      updateFields.bio = bio;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.json({ notifications: user.notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notification = user.notifications.id(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await user.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'notifications.$[].read': true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('achievements questionsAsked doubtsResolved credits');
    
    // Define all possible achievements
    const allAchievements = [
      {
        name: 'First Question',
        description: 'Asked your first question',
        earned: user.questionsAsked > 0
      },
      {
        name: 'Problem Solver',
        description: 'Had a question marked as solved',
        earned: user.achievements.some(ach => ach.name === 'Problem Solver')
      },
      {
        name: 'Helpful Mentor',
        description: 'Provided 5+ helpful responses',
        earned: user.doubtsResolved >= 5
      },
      {
        name: 'Credit Collector',
        description: 'Earned 100+ credits',
        earned: user.credits >= 100
      },
      {
        name: 'Community Helper',
        description: 'Resolved 10+ doubts',
        earned: user.doubtsResolved >= 10
      },
      {
        name: 'Question Master',
        description: 'Asked 10+ questions',
        earned: user.questionsAsked >= 10
      }
    ];

    res.json({
      achievements: allAchievements,
      earnedAchievements: user.achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;