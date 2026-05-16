const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const jwtSecret = process.env.JWT_SECRET || 'tradeconnect-secret';

  if (!token) {
    next(new AppError('Authentication required', 401));
    return;
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform this action', 403));
      return;
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};