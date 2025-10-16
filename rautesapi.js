const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TaskCode = require('../models/TaskCode');
const Withdrawal = require('../models/Withdrawal');
const { generateUniqueCode } = require('../utils/codeGenerator');
const {
  startBotValidation,
  generateCodeValidation,
  verifyCodeValidation,
  userBalanceValidation,
  withdrawValidation
} = require('../middleware/validation');
const { strictLimiter } = require('../middleware/rateLimiter');

router.post('/start-bot', startBotValidation, async (req, res) => {
  try {
    const { telegram_user_id, referrer_id } = req.body;

    let user = await User.findOne({ telegram_user_id });
    
    if (user) {
      return res.json({
        success: true,
        message: 'User already exists',
        user: {
          telegram_user_id: user.telegram_user_id,
          balance: user.balance
        }
      });
    }

    user = new User({
      telegram_user_id,
      referrer_id: referrer_id || null,
      balance: 0,
      total_earned: 0
    });

    await user.save();

    if (referrer_id) {
      try {
        const referrer = await User.findOne({ telegram_user_id: referrer_id });
        if (referrer) {
          referrer.balance += 5;
          referrer.total_earned += 5;
          await referrer.save();
        }
      } catch (referralError) {
        console.error('Referral processing error:', referralError);
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
    console.error('Start bot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/generate-code', strictLimiter, generateCodeValidation, async (req, res) => {
  try {
    const { telegram_user_id, campaign_id } = req.body;

    const user = await User.findOne({ telegram_user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please start the bot first.'
      });
    }

    let code;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      code = generateUniqueCode();
      attempts++;
      
      if (attempts > maxAttempts) {
        return res.status(500).json({
          success: false,
          message: 'Unable to generate unique code. Please try again.'
        });
      }
    } while (await TaskCode.findOne({ code }));

    const taskCode = new TaskCode({
      user_id: telegram_user_id,
      code,
      campaign_id: campaign_id || null,
      status: 'PENDING',
      points_value: 2
    });

    await taskCode.save();

    res.json({
      success: true,
      code,
      expires_in: '2 hours',
      points_value: 2
    });

  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/verify-code', strictLimiter, verifyCodeValidation, async (req, res) => {
  try {
    const { telegram_user_id, received_code } = req.body;

    const taskCode = await TaskCode.findOne({ 
      user_id: telegram_user_id, 
      code: received_code.toUpperCase() 
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

    const now = new Date();
    const codeAge = (now - taskCode.created_at) / 1000 / 60;
    if (codeAge > 120) {
      taskCode.status = 'FAILED';
      await taskCode.save();
      
      return res.status(400).json({
        success: false,
        message: 'Code expired'
      });
    }

    const user = await User.findOne({ telegram_user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.balance += taskCode.points_value;
    user.total_earned += taskCode.points_value;
    user.last_activity = new Date();
    
    taskCode.status = 'APPROVED';

    await Promise.all([user.save(), taskCode.save()]);

    res.json({
      success: true,
      message: 'Code verified successfully',
      points_earned: taskCode.points_value,
      new_balance: user.balance
    });

  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/verify-group-join', async (req, res) => {
  try {
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

    const pointsEarned = 2;
    user.balance += pointsEarned;
    user.total_earned += pointsEarned;
    user.last_activity = new Date();
    
    await user.save();

    res.json({
      success: true,
      message: 'Group membership verified successfully',
      points_earned: pointsEarned,
      new_balance: user.balance
    });

  } catch (error) {
    console.error('Verify group join error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/user-balance/:telegram_user_id', userBalanceValidation, async (req, res) => {
  try {
    const { telegram_user_id } = req.params;

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
          minimum_withdrawal: "500 Points ($5 USD)"
        }
      }
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/withdraw-request', withdrawValidation, async (req, res) => {
  try {
    const { telegram_user_id, amount } = req.body;

    const user = await User.findOne({ telegram_user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is 500 points'
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    user.balance -= amount;
    await user.save();

    const withdrawal = new Withdrawal({
      telegram_user_id,
      amount,
      status: 'PENDING'
    });

    await withdrawal.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal_id: withdrawal._id,
      amount_deducted: amount,
      new_balance: user.balance
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;