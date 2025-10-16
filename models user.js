const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegram_user_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  referrer_id: {
    type: String,
    default: null
  },
  total_earned: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_activity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ telegram_user_id: 1 });
userSchema.index({ referrer_id: 1 });

module.exports = mongoose.model('User', userSchema);