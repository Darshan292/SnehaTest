const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 50 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [5, 'Minimum credits is 5'],
    max: [1000, 'Maximum credits is 1000']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'solved', 'closed'],
    default: 'open'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  views: {
    type: Number,
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
  solvedAt: {
    type: Date
  },
  solvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for response count
questionSchema.virtual('responseCount', {
  ref: 'Response',
  localField: '_id',
  foreignField: 'question',
  count: true
});

// Virtual for net votes
questionSchema.virtual('netVotes').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Indexes for better query performance
questionSchema.index({ author: 1, createdAt: -1 });
questionSchema.index({ status: 1, createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ title: 'text', description: 'text' });
questionSchema.index({ credits: -1 });

// Middleware to populate author info
questionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'username avatar credits'
  });
  next();
});

// Method to check if user can edit this question
questionSchema.methods.canEdit = function(userId) {
  return this.author._id.toString() === userId.toString();
};

// Method to mark as solved
questionSchema.methods.markAsSolved = function(solvedByUserId) {
  this.status = 'solved';
  this.solvedAt = new Date();
  this.solvedBy = solvedByUserId;
  return this.save();
};

// Method to increment views
questionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Question', questionSchema);