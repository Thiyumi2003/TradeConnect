const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const jwtSecret = process.env.JWT_SECRET || 'tradeconnect-secret';

  if (!token) {
    next(new AppError('Login required', 401));
    return;
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = requireAuth;