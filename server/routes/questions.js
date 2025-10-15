const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Question = require('../models/Question');
const Response = require('../models/Response');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with pagination and filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['open', 'solved', 'closed']).withMessage('Invalid status'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'credits', 'popular']).withMessage('Invalid sort option')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, tags, sortBy = 'newest' } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'credits':
        sort = { credits: -1, createdAt: -1 };
        break;
      case 'popular':
        sort = { views: -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('responseCount')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      questions,
      pagination: {
        currentPage: page,
        totalPages,
        totalQuestions: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question with responses
// @access  Public
// In your question routes file
// @route   GET /api/questions/:id
// @desc    Get question by ID with responses
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching question with ID:', req.params.id);

    // Simple query without any population first
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    console.log('Raw question found:', question);

    // Simple response query
    const responses = await Response.find({ question: req.params.id });
    
    console.log('Raw responses found:', responses.length);

    // Return minimal data structure
    res.json({
      question: {
        _id: question._id,
        title: question.title,
        description: question.description,
        credits: question.credits,
        status: question.status,
        author: question.author, // This will be ObjectId, not populated
        createdAt: question.createdAt,
        responseCount: responses.length
      },
      responses: responses.map(r => ({
        _id: r._id,
        content: r.content,
        author: r.author, // This will be ObjectId, not populated
        createdAt: r.createdAt,
        isHelpful: r.isHelpful,
        credits: r.credits
      }))
    });

  } catch (error) {
    console.error('Minimal route error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: error.stack
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', [
  auth,
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('credits')
    .isInt({ min: 5, max: 1000 })
    .withMessage('Credits must be between 5 and 1000'),
  body('tags')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 tags allowed')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, description, credits, tags } = req.body;

    // Check if user has enough credits
    const user = await User.findById(req.user.id);
    if (user.credits < credits) {
      return res.status(400).json({ 
        message: 'Insufficient credits to post this question' 
      });
    }

    // Create question
    const question = new Question({
      title,
      description,
      credits,
      tags: tags || [],
      author: req.user.id
    });

    await question.save();

    // Deduct credits from user and increment questions asked
    user.credits -= credits;
    user.questionsAsked += 1;
    await user.save();

    // Add achievement for first question
    if (user.questionsAsked === 1) {
      await user.addAchievement('First Question', 'Asked your first question');
    }

    // Populate author info
    await question.populate('author', 'username avatar credits');

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('new-question', {
      question: question.toJSON(),
      message: `New question posted: ${question.title}`
    });

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('tags')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 tags allowed')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const question = await Question.findById(req.params.id);
    
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.canEdit(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to edit this question' });
    }

    const { title, description, tags } = req.body;
    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (tags) updateFields.tags = tags;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar credits');

    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.canEdit(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Soft delete
    // question.isActive = false;
    // await question.save();

    // // Also soft delete all responses
    // await Response.updateMany(
    //   { question: req.params.id },
    //   { isActive: false }
    // );
    
    // Hard delete
    await Question.deleteOne({ _id: req.params.id });
    await Response.deleteMany({ question: req.params.id });

    // Refund credits to user
    const user = await User.findById(req.user.id);
    user.credits += question.credits;
    user.questionsAsked = Math.max(0, user.questionsAsked - 1);
    await user.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/questions/:id/solve
// @desc    Mark question as solved
// @access  Private
router.put('/:id/solve', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.canEdit(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to mark this question as solved' });
    }

    if (question.status === 'solved') {
      return res.status(400).json({ message: 'Question is already marked as solved' });
    }

    await question.markAsSolved(req.user.id);

    // Add achievement
    const user = await User.findById(req.user.id);
    await user.addAchievement('Problem Solver', 'Had a question marked as solved');

    res.json({
      message: 'Question marked as solved',
      question
    });
  } catch (error) {
    console.error('Mark question solved error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/questions/user/:userId
// @desc    Get questions by user
// @access  Public
router.get('/user/:userId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ 
      author: req.params.userId, 
      isActive: true 
    })
    .populate('responseCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Question.countDocuments({ 
      author: req.params.userId, 
      isActive: true 
    });

    res.json({
      questions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalQuestions: total
      }
    });
  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;