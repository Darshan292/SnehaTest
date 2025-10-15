const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Response content is required'],
    trim: true,
    minlength: [10, 'Response must be at least 10 characters'],
    maxlength: [5000, 'Response cannot exceed 5000 characters']
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  credits: {
    type: Number,
    min: [0, 'Credits cannot be negative'],
    max: [500, 'Maximum credits per response is 500'],
    default: 0
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHelpful: {
    type: Boolean,
    default: false
  },
  markedHelpfulBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  markedHelpfulAt: {
    type: Date
  },
  payments: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Payment amount must be at least 1']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for net votes
responseSchema.virtual('netVotes').get(function() {
  try {
    const upvotesLength = Array.isArray(this.upvotes) ? this.upvotes.length : 0;
    const downvotesLength = Array.isArray(this.downvotes) ? this.downvotes.length : 0;
    return upvotesLength - downvotesLength;
  } catch (error) {
    console.error('NetVotes virtual error:', error);
    return 0;
  }
});

// Virtual for total payments received
responseSchema.virtual('totalPayments').get(function() {
  try {
    if (!Array.isArray(this.payments)) return 0;
    return this.payments.reduce((total, payment) => {
      return total + (payment && payment.amount ? payment.amount : 0);
    }, 0);
  } catch (error) {
    console.error('TotalPayments virtual error:', error);
    return 0;
  }
});

// Indexes for better query performance
responseSchema.index({ question: 1, createdAt: -1 });
responseSchema.index({ author: 1, createdAt: -1 });
responseSchema.index({ isHelpful: 1 });

// Middleware to populate author and question info
responseSchema.pre(/^find/, function(next) {
  try {
    this.populate({
      path: 'author',
      select: 'username avatar credits'
    }).populate({
      path: 'question',
      select: 'title author'
    });
    next();
  } catch (error) {
    console.error('Response pre-middleware error:', error);
    next(error);
  }
});

// Add error handling to virtual getters




// Method to check if user can edit this response
responseSchema.methods.canEdit = function(userId) {
  return this.author._id.toString() === userId.toString();
};

// Method to mark as helpful
responseSchema.methods.markAsHelpful = function(markedByUserId) {
  this.isHelpful = true;
  this.markedHelpfulBy = markedByUserId;
  this.markedHelpfulAt = new Date();
  return this.save();
};

// Method to add payment
responseSchema.methods.addPayment = function(fromUserId, amount) {
  this.payments.push({
    from: fromUserId,
    amount: amount,
    createdAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Response', responseSchema);