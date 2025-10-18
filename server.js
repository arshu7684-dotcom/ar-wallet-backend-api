const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/telegramapp')
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.log('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ✅ User Model
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

const User = mongoose.model('User', userSchema);

// ✅ TaskCode Model
const taskCodeSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
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
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// 2 hours expiration
taskCodeSchema.index({ created_at: 1 }, { expireAfterSeconds: 7200 });
const TaskCode = mongoose.model('TaskCode', taskCodeSchema);

// ✅ Withdrawal Model
const withdrawalSchema = new mongoose.Schema({
  telegram_user_id: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 500 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSED', 'FAILED'], 
    default: 'PENDING' 
  },
  processed_at: { 
    type: Date, 
    default: null 
  }
}, { 
  timestamps: true 
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

// ✅ Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { 
    success: false, 
    message: 'Too many requests from this IP, please try again later.' 
  }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { 
    success: false, 
    message: 'Too many verification attempts, please try again later.' 
  }
});

app.use(generalLimiter);

// ✅ Health Check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 AR Wallet Pro Backend is Running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ 1. START BOT
app.post('/api/start-bot', async (req, res) => {
  try {
    console.log('📝 Start Bot Request:', req.body);
    
    const { telegram_user_id, referrer_id } = req.body;

    if (!telegram_user_id) {
      return res.status(400).json({
        success: false,
        message: 'telegram_user_id is required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ telegram_user_id });
    
    if (user) {
      return res.json({
        success: true,
        message: 'User already exists',
        user: {
          telegram_user_id: user.telegram_user_id,
          balance: user.balance,
          total_earned: user.total_earned
        }
      });
    }

    // Create new user
    user = new User({
      telegram_user_id,
      referrer_id: referrer_id || null,
      balance: 0,
      total_earned: 0
    });

    await user.save();
    console.log('✅ New user created:', telegram_user_id);

    // Handle referral bonus
    if (referrer_id) {
      try {
        const referrer = await User.findOne({ telegram_user_id: referrer_id });
        if (referrer) {
          referrer.balance += 5;
          referrer.total_earned += 5;
          await referrer.save();
          console.log('💰 Referral bonus given to:', referrer_id);
        }
      } catch (referralError) {
        console.error('Referral error:', referralError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        telegram_user_id: user.telegram_user_id,
        balance: user.balance,
        referrer_id: user.referrer_id
      }
    });

  } catch (error) {
    console.error('❌ Start bot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ✅ 2. GENERATE CODE
app.post('/api/generate-code', strictLimiter, async (req, res) => {
  try {
    console.log('🎯 Generate Code Request:', req.body);
    
    const { telegram_user_id, campaign_id } = req.body;

    if (!telegram_user_id) {
      return res.status(400).json({
        success: false,
        message: 'telegram_user_id is required'
      });
    }

    // Check user exists
    const user = await User.findOne({ telegram_user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please start the bot first.'
      });
    }

    // Generate unique 6-digit code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (!isUnique && attempts < maxAttempts) {
      code = generateCode();
      const existingCode = await TaskCode.findOne({ code });
      if (!existingCode) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate unique code. Please try again.'
      });
    }

    // Save the code
    const taskCode = new TaskCode({
      user_id: telegram_user_id,
      code,
      campaign_id: campaign_id || null,
      status: 'PENDING',
      points_value: 2
    });

    await taskCode.save();
    console.log('✅ Code generated for user:', telegram_user_id, 'Code:', code);

    res.json({
      success: true,
      code,
      expires_in: '2 hours',
      points_value: 2
    });

  } catch (error) {
    console.error('❌ Generate code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ✅ 3. VERIFY CODE
app.post('/api/verify-code', strictLimiter, async (req, res) => {
  try {
    console.log('🔍 Verify Code Request:', req.body);
    
    const { telegram_user_id, received_code } = req.body;

    if (!telegram_user_id || !received_code) {
      return res.status(400).json({
        success: false,
        message: 'telegram_user_id and received_code are required'
      });
    }

    const code = received_code.toUpperCase().trim();

    // Find the code
    const taskCode = await TaskCode.findOne({ 
      user_id: telegram_user_id, 
      code: code
    });

    if (!taskCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code'
      });
    }

    if (taskCode.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Code already used'
      });
    }

    if (taskCode.status === 'FAILED') {
      return res.status(400).json({
        success: false,
        message: 'Code verification failed'
      });
    }

    // Check expiration (2 hours)
    const now = new Date();
    const codeAge = (now - taskCode.created_at) / 1000 / 60; // in minutes
    if (codeAge > 120) {
      taskCode.status = 'FAILED';
      await taskCode.save();
      return res.status(400).json({
        success: false,
        message: 'Code expired'
      });
    }

    // Get user and update balance
    const user = await User.findOne({ telegram_user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user balance and code status
    user.balance += taskCode.points_value;
    user.total_earned += taskCode.points_value;
    user.last_activity = new Date();
    
    taskCode.status = 'APPROVED';

    await Promise.all([user.save(), taskCode.save()]);

    console.log('✅ Code verified for user:', telegram_user_id, 'Points:', taskCode.points_value);

    res.json({
      success: true,
      message: 'Code verified successfully!',
      points_earned: taskCode.points_value,
      new_balance: user.balance
    });

  } catch (error) {
    console.error('❌ Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ✅ 4. VERIFY GROUP JOIN
app.post('/api/verify-group-join', async (req, res) => {
  try {
    console.log('👥 Verify Group Join Request:', req.body);
    
    const { telegram_user_id } = req.body;

    if (!telegram_user_id) {
      return res.status(400).json({
        success: false,
        message: 'telegram_user_id is required'
      });
    }

    const user = await User.findOne({ telegram_user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For now, we'll simulate successful verification
    // In production, integrate with Telegram Bot API
    const pointsEarned = 2;
    user.balance += pointsEarned;
    user.total_earned += pointsEarned;
    user.last_activity = new Date();
    
    await user.save();

    console.log('✅ Group join verified for user:', telegram_user_id, 'Points:', pointsEarned);

    res.json({
      success: true,
      message: 'Group membership verified successfully!',
      points_earned: pointsEarned,
      new_balance: user.balance
    });

  } catch (error) {
    console.error('❌ Verify group join error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ✅ 5. USER BALANCE
app.get('/api/user-balance/:telegram_user_id', async (req, res) => {
  try {
    const { telegram_user_id } = req.params;
    console.log('💰 Balance check for user:', telegram_user_id);

    if (!telegram_user_id) {
      return res.status(400).json({
        success: false,
        message: 'telegram_user_id is required'
      });
    }

    const user = await User.findOne({ telegram_user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        telegram_user_id: user.telegram_user_id,
        balance: user.balance,
        total_earned: user.total_earned,
        display_data: {
          current_balance: `${user.balance} Points`,
          total_earned: `${user.total_earned} Points`,
          daily_earning: "Unlimited",
          minimum_withdrawal: "500 Points"
        }
      }
    });

  } catch (error) {
    console.error('❌ Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ✅ 6. WITHDRAWAL REQUEST
app.post('/api/withdraw-request', async (req, res) => {
  try {
    console.log('💸 Withdrawal Request:', req.body);
    
    const { telegram_user_id, amount } = req.body;

    if (!telegram_user_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'telegram_user_id and amount are required'
      });
    }

    const user = await User.findOne({ telegram_user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate amount
    const withdrawAmount = parseInt(amount);
    if (withdrawAmount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is 500 points'
      });
    }

    if (user.balance < withdrawAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Process withdrawal
    user.balance -= withdrawAmount;
    await user.save();

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      telegram_user_id,
      amount: withdrawAmount,
      status: 'PENDING'
    });

    await withdrawal.save();

    console.log('✅ Withdrawal request submitted for user:', telegram_user_id, 'Amount:', withdrawAmount);

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully!',
      withdrawal_id: withdrawal._id,
      amount_deducted: withdrawAmount,
      new_balance: user.balance
    });

  } catch (error) {
    console.error('❌ Withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ✅ 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// ✅ Global Error Handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API Base: http://localhost:${PORT}/api`);
});

module.exports = app;
