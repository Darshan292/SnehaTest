const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Response = require('../models/Response');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments
// @desc    Process a payment for a helpful response
// @access  Private
router.post('/', [
  auth,
  body('responseId')
    .isMongoId()
    .withMessage('Invalid response ID'),
  body('amount')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Payment amount must be between 1 and 1000'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { responseId, amount, description = '' } = req.body;

    // Get response and validate
    const response = await Response.findById(responseId);
    if (!response || !response.isActive) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Get question to validate payment eligibility
    const question = await Question.findById(response.question);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is trying to pay themselves
    if (response.author._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot pay yourself' });
    }

    // Check if user has enough credits
    const payer = await User.findById(req.user.id);
    if (payer.credits < amount) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    // Get recipient
    const recipient = await User.findById(response.author._id);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create payment record
    const payment = new Payment({
      from: req.user.id,
      to: response.author._id,
      amount,
      question: response.question,
      response: responseId,
      description,
      status: 'pending'
    });

    await payment.save();

    try {
      // Process the payment (deduct from payer, add to recipient)
      payer.credits -= amount;
      recipient.credits += amount;

      await payer.save();
      await recipient.save();

      // Add payment to response
      await response.addPayment(req.user.id, amount);

      // Mark payment as completed
      await payment.markAsCompleted();

      // Add notifications
      await recipient.addNotification(
        `You received ${amount} credits for your helpful response!`,
        'success'
      );

      await payer.addNotification(
        `Payment of ${amount} credits sent successfully to ${recipient.username}`,
        'info'
      );

      // Check for credit collector achievement
      if (recipient.credits >= 100) {
        await recipient.addAchievement('Credit Collector', 'Earned 100+ credits');
      }

      // Populate payment data
      await payment.populate([
        { path: 'from', select: 'username avatar' },
        { path: 'to', select: 'username avatar' },
        { path: 'question', select: 'title' },
        { path: 'response', select: 'content' }
      ]);

      // Emit real-time event
      const io = req.app.get('io');
      io.emit('payment-completed', {
        payment: payment.toJSON(),
        message: `Payment of ${amount} credits completed`
      });

      res.status(201).json({
        message: 'Payment processed successfully',
        payment,
        newBalance: payer.credits
      });

    } catch (processError) {
      // Mark payment as failed
      await payment.markAsFailed(processError.message);
      throw processError;
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// @route   GET /api/payments
// @desc    Get user's payment history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type = 'all' } = req.query; // 'sent', 'received', 'all'

    let query = {};
    
    if (type === 'sent') {
      query.from = req.user.id;
    } else if (type === 'received') {
      query.to = req.user.id;
    } else {
      query.$or = [
        { from: req.user.id },
        { to: req.user.id }
      ];
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPayments: total
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user is involved in this payment
    if (payment.from.toString() !== req.user.id && payment.to.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/stats/summary
// @desc    Get payment statistics for user
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get payment statistics
    const [sentStats, receivedStats] = await Promise.all([
      Payment.aggregate([
        { $match: { from: userId, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: '$amount' },
            countSent: { $sum: 1 }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { to: userId, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalReceived: { $sum: '$amount' },
            countReceived: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = {
      totalSent: sentStats[0]?.totalSent || 0,
      countSent: sentStats[0]?.countSent || 0,
      totalReceived: receivedStats[0]?.totalReceived || 0,
      countReceived: receivedStats[0]?.countReceived || 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;