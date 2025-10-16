const { randomBytes } = require('crypto');

function generateUniqueCode() {
  return randomBytes(3).toString('hex').toUpperCase();
}

function isValidTelegramUserId(userId) {
  return typeof userId === 'string' && userId.trim().length > 0;
}

module.exports = {
  generateUniqueCode,
  isValidTelegramUserId
};