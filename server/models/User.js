const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  credits: {
    type: Number,
    default: 100,
    min: [0, 'Credits cannot be negative']
  },
  questionsAsked: {
    type: Number,
    default: 0,
    min: [0, 'Questions asked cannot be negative']
  },
  doubtsResolved: {
    type: Number,
    default: 0,
    min: [0, 'Doubts resolved cannot be negative']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: [{
    message: String,
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's rank (calculated based on credits)
userSchema.virtual('rank').get(function() {
  // This will be calculated in the leaderboard route
  return this._rank || 0;
});

// Index for better query performance
userSchema.index({ credits: -1 });
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Add notification method
userSchema.methods.addNotification = function(message, type = 'info') {
  this.notifications.unshift({
    message,
    type,
    read: false,
    createdAt: new Date()
  });
  
  // Keep only last 50 notifications
  if (this.notifications.length > 50) {
    this.notifications = this.notifications.slice(0, 50);
  }
  
  return this.save();
};

// Add achievement method
userSchema.methods.addAchievement = function(name, description) {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(ach => ach.name === name);
  if (existingAchievement) return this;
  
  this.achievements.push({
    name,
    description,
    earnedAt: new Date()
  });
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);