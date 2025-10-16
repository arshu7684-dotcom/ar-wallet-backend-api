const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const startBotValidation = [
  body('telegram_user_id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Valid telegram_user_id is required'),
  body('referrer_id')
    .optional()
    .isString()
    .trim()
    .withMessage('Referrer ID must be a string'),
  handleValidationErrors
];

const generateCodeValidation = [
  body('telegram_user_id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Valid telegram_user_id is required'),
  body('campaign_id')
    .optional()
    .isString()
    .trim()
    .withMessage('Campaign ID must be a string'),
  handleValidationErrors
];

const verifyCodeValidation = [
  body('telegram_user_id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Valid telegram_user_id is required'),
  body('received_code')
    .isString()
    .trim()
    .isLength({ min: 6, max: 6 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must be 6-digit alphanumeric'),
  handleValidationErrors
];

const userBalanceValidation = [
  param('telegram_user_id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Valid telegram_user_id is required'),
  handleValidationErrors
];

const withdrawValidation = [
  body('telegram_user_id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Valid telegram_user_id is required'),
  body('amount')
    .isInt({ min: 500 })
    .withMessage('Minimum withdrawal amount is 500 points'),
  handleValidationErrors
];

module.exports = {
  startBotValidation,
  generateCodeValidation,
  verifyCodeValidation,
  userBalanceValidation,
  withdrawValidation
};