const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Payment amount must be at least 1'],
    max: [1000, 'Payment amount cannot exceed 1000']
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  response: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  processedAt: {
    type: Date
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentSchema.index({ from: 1, createdAt: -1 });
paymentSchema.index({ to: 1, createdAt: -1 });
paymentSchema.index({ question: 1 });
paymentSchema.index({ response: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

// Middleware to populate user and question info
paymentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'from',
    select: 'username avatar'
  }).populate({
    path: 'to',
    select: 'username avatar'
  }).populate({
    path: 'question',
    select: 'title'
  }).populate({
    path: 'response',
    select: 'content'
  });
  next();
});

// Generate unique transaction ID
paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.processedAt = new Date();
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.processedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);