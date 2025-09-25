const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Question = require('../models/Question');
const Response = require('../models/Response');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get leaderboard with rankings
// @access  Public
router.get('/', [
  query('period').optional().isIn(['weekly', 'monthly', 'all-time']).withMessage('Invalid period'),
  query('sortBy').optional().isIn(['credits', 'questions', 'resolved']).withMessage('Invalid sort option'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { period = 'all-time', sortBy = 'credits', limit = 50 } = req.query;

    // Calculate date range for period filtering
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    let users;

    if (period === 'all-time') {
      // For all-time, use the stored values in user documents
      let sortField = {};
      switch (sortBy) {
        case 'questions':
          sortField = { questionsAsked: -1, credits: -1 };
          break;
        case 'resolved':
          sortField = { doubtsResolved: -1, credits: -1 };
          break;
        default:
          sortField = { credits: -1, doubtsResolved: -1 };
      }

      users = await User.find({ isActive: true })
        .select('username avatar credits questionsAsked doubtsResolved createdAt')
        .sort(sortField)
        .limit(parseInt(limit));

    } else {
      // For weekly/monthly, calculate from actual data
      const pipeline = [
        {
          $match: { isActive: true }
        },
        {
          $lookup: {
            from: 'questions',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$author', '$$userId'] },
                  isActive: true,
                  ...dateFilter
                }
              }
            ],
            as: 'periodQuestions'
          }
        },
        {
          $lookup: {
            from: 'responses',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$author', '$$userId'] },
                  isActive: true,
                  ...dateFilter
                }
              }
            ],
            as: 'periodResponses'
          }
        },
        {
          $lookup: {
            from: 'payments',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$to', '$$userId'] },
                  status: 'completed',
                  ...dateFilter
                }
              },
              {
                $group: {
                  _id: null,
                  totalCredits: { $sum: '$amount' }
                }
              }
            ],
            as: 'periodCredits'
          }
        },
        {
          $addFields: {
            periodQuestionsAsked: { $size: '$periodQuestions' },
            periodDoubtsResolved: { $size: '$periodResponses' },
            periodCreditsEarned: {
              $ifNull: [{ $arrayElemAt: ['$periodCredits.totalCredits', 0] }, 0]
            }
          }
        },
        {
          $project: {
            username: 1,
            avatar: 1,
            credits: '$periodCreditsEarned',
            questionsAsked: '$periodQuestionsAsked',
            doubtsResolved: '$periodDoubtsResolved',
            createdAt: 1
          }
        }
      ];

      // Add sorting
      let sortStage = {};
      switch (sortBy) {
        case 'questions':
          sortStage = { questionsAsked: -1, credits: -1 };
          break;
        case 'resolved':
          sortStage = { doubtsResolved: -1, credits: -1 };
          break;
        default:
          sortStage = { credits: -1, doubtsResolved: -1 };
      }

      pipeline.push({ $sort: sortStage });
      pipeline.push({ $limit: parseInt(limit) });

      users = await User.aggregate(pipeline);
    }

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      ...user.toObject ? user.toObject() : user,
      rank: index + 1
    }));

    // Find current user's rank if authenticated
    let currentUserRank = null;
    if (req.user) {
      const currentUserIndex = leaderboard.findIndex(
        user => user._id.toString() === req.user.id
      );
      if (currentUserIndex !== -1) {
        currentUserRank = currentUserIndex + 1;
      } else {
        // User not in top results, calculate their actual rank
        let rankQuery = { isActive: true };
        
        if (period === 'all-time') {
          switch (sortBy) {
            case 'questions':
              rankQuery.questionsAsked = { $gt: req.user.questionsAsked };
              break;
            case 'resolved':
              rankQuery.doubtsResolved = { $gt: req.user.doubtsResolved };
              break;
            default:
              rankQuery.credits = { $gt: req.user.credits };
          }
        }
        
        const usersAhead = await User.countDocuments(rankQuery);
        currentUserRank = usersAhead + 1;
      }
    }

    res.json({
      leaderboard,
      currentUserRank,
      period,
      sortBy,
      totalUsers: await User.countDocuments({ isActive: true })
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/stats
// @desc    Get overall platform statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalResponses,
      totalCreditsCirculated
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: true }),
      Response.countDocuments({ isActive: true }),
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$credits' } } }
      ])
    ]);

    const stats = {
      totalUsers,
      totalQuestions,
      totalResponses,
      totalCreditsCirculated: totalCreditsCirculated[0]?.total || 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/top-contributors
// @desc    Get top contributors by category
// @access  Public
router.get('/top-contributors', async (req, res) => {
  try {
    const [
      topByCredits,
      topByQuestions,
      topByResponses,
      topByHelpfulResponses
    ] = await Promise.all([
      User.find({ isActive: true })
        .select('username avatar credits')
        .sort({ credits: -1 })
        .limit(5),
      
      User.find({ isActive: true })
        .select('username avatar questionsAsked')
        .sort({ questionsAsked: -1 })
        .limit(5),
      
      User.find({ isActive: true })
        .select('username avatar doubtsResolved')
        .sort({ doubtsResolved: -1 })
        .limit(5),
      
      Response.aggregate([
        { $match: { isActive: true, isHelpful: true } },
        { $group: { _id: '$author', helpfulCount: { $sum: 1 } } },
        { $sort: { helpfulCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            username: '$user.username',
            avatar: '$user.avatar',
            helpfulCount: 1
          }
        }
      ])
    ]);

    res.json({
      topByCredits,
      topByQuestions,
      topByResponses,
      topByHelpfulResponses
    });
  } catch (error) {
    console.error('Get top contributors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;