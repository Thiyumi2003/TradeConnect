const express = require('express');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = normalizeText(req.body.email).toLowerCase();
    const password = normalizeText(req.body.password);

    const expectedEmail = (process.env.USER_EMAIL || 'demo@tradeconnect.com').toLowerCase();
    const expectedPassword = process.env.USER_PASSWORD || 'password123';
    const jwtSecret = process.env.JWT_SECRET || 'tradeconnect-secret';

    if (email !== expectedEmail || password !== expectedPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { sub: email, email },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { email },
    });
  })
);

module.exports = router;