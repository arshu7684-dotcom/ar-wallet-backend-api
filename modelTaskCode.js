const mongoose = require('mongoose');

const taskCodeSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z0-9]{6}$/, 'Code must be 6-digit alphanumeric']
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'FAILED'],
    default: 'PENDING'
  },
  campaign_id: {
    type: String,
    default: null
  },
  points_value: {
    type: Number,
    default: 2
  },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 7200
  }
}, {
  timestamps: true
});

taskCodeSchema.index({ user_id: 1, status: 1 });
taskCodeSchema.index({ code: 1 });
taskCodeSchema.index({ created_at: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model('TaskCode', taskCodeSchema);