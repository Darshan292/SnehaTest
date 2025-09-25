const express = require('express');
const { body, validationResult } = require('express-validator');
const Response = require('../models/Response');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/responses
// @desc    Create a new response
// @access  Private
router.post('/', [
  auth,
  body('content')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Response must be between 10 and 5000 characters'),
  body('questionId')
    .isMongoId()
    .withMessage('Invalid question ID'),
  body('credits')
    .optional()
    .isInt({ min: 0, max: 500 })
    .withMessage('Credits must be between 0 and 500')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { content, questionId, credits = 0 } = req.body;

    // Check if question exists and is active
    const question = await Question.findById(questionId);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.status !== 'open') {
      return res.status(400).json({ message: 'Cannot respond to a closed or solved question' });
    }

    // Check if user is trying to respond to their own question
    if (question.author._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot respond to your own question' });
    }

    // Create response
    const response = new Response({
      content,
      question: questionId,
      author: req.user.id,
      credits
    });

    await response.save();

    // Update user's doubts resolved count
    const user = await User.findById(req.user.id);
    user.doubtsResolved += 1;
    await user.save();

    // Add achievements
    if (user.doubtsResolved === 5) {
      await user.addAchievement('Helpful Mentor', 'Provided 5+ helpful responses');
    }
    if (user.doubtsResolved === 10) {
      await user.addAchievement('Community Helper', 'Resolved 10+ doubts');
    }

    // Notify question author
    const questionAuthor = await User.findById(question.author._id);
    await questionAuthor.addNotification(
      `New response to your question: ${question.title}`,
      'info'
    );

    // Populate response data
    await response.populate('author', 'username avatar credits');

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`question-${questionId}`).emit('new-response', {
      response: response.toJSON(),
      questionId
    });

    res.status(201).json({
      message: 'Response created successfully',
      response
    });
  } catch (error) {
    console.error('Create response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/responses/:id
// @desc    Update a response
// @access  Private
router.put('/:id', [
  auth,
  body('content')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Response must be between 10 and 5000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const response = await Response.findById(req.params.id);
    
    if (!response || !response.isActive) {
      return res.status(404).json({ message: 'Response not found' });
    }

    if (!response.canEdit(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to edit this response' });
    }

    response.content = req.body.content;
    await response.save();

    await response.populate('author', 'username avatar credits');

    res.json({
      message: 'Response updated successfully',
      response
    });
  } catch (error) {
    console.error('Update response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/responses/:id
// @desc    Delete a response (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    
    if (!response || !response.isActive) {
      return res.status(404).json({ message: 'Response not found' });
    }

    if (!response.canEdit(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this response' });
    }

    // Soft delete
    response.isActive = false;
    await response.save();

    // Update user's doubts resolved count
    const user = await User.findById(req.user.id);
    user.doubtsResolved = Math.max(0, user.doubtsResolved - 1);
    await user.save();

    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/responses/:id/helpful
// @desc    Mark response as helpful
// @access  Private
router.put('/:id/helpful', auth, async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    
    if (!response || !response.isActive) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check if user is the question author
    const question = await Question.findById(response.question);
    if (question.author._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only question author can mark responses as helpful' });
    }

    if (response.isHelpful) {
      return res.status(400).json({ message: 'Response is already marked as helpful' });
    }

    await response.markAsHelpful(req.user.id);

    // Notify response author
    const responseAuthor = await User.findById(response.author._id);
    await responseAuthor.addNotification(
      `Your response was marked as helpful!`,
      'success'
    );

    res.json({
      message: 'Response marked as helpful',
      response
    });
  } catch (error) {
    console.error('Mark response helpful error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/responses/:id/vote
// @desc    Vote on a response (upvote/downvote)
// @access  Private
router.put('/:id/vote', [
  auth,
  body('type').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const response = await Response.findById(req.params.id);
    
    if (!response || !response.isActive) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Check if user is trying to vote on their own response
    if (response.author._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot vote on your own response' });
    }

    const { type } = req.body;
    const userId = req.user.id;

    // Remove existing votes by this user
    response.upvotes = response.upvotes.filter(vote => vote.user.toString() !== userId);
    response.downvotes = response.downvotes.filter(vote => vote.user.toString() !== userId);

    // Add new vote
    if (type === 'upvote') {
      response.upvotes.push({ user: userId });
    } else {
      response.downvotes.push({ user: userId });
    }

    await response.save();

    res.json({
      message: `Response ${type}d successfully`,
      netVotes: response.netVotes
    });
  } catch (error) {
    console.error('Vote response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/responses/user/:userId
// @desc    Get responses by user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const responses = await Response.find({ 
      author: req.params.userId, 
      isActive: true 
    })
    .populate('question', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Response.countDocuments({ 
      author: req.params.userId, 
      isActive: true 
    });

    res.json({
      responses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResponses: total
      }
    });
  } catch (error) {
    console.error('Get user responses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;