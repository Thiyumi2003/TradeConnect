const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const allowedRoles = ['homeowner', 'tradesperson'];

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createToken(user) {
  const jwtSecret = process.env.JWT_SECRET || 'tradeconnect-secret';

  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: '1d' }
  );
}

function buildAuthPayload(user) {
  return {
    token: createToken(user),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const name = normalizeText(req.body.name);
    const email = normalizeText(req.body.email).toLowerCase();
    const password = normalizeText(req.body.password);
    const role = normalizeText(req.body.role).toLowerCase();

    if (!name || !email || !password || !role) {
      throw new AppError('All fields are required', 400);
    }

    if (!allowedRoles.includes(role)) {
      throw new AppError('Role must be homeowner or tradesperson', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, passwordSalt);

    const user = await User.create({
      name,
      email,
      passwordSalt,
      passwordHash,
      role,
    });

    res.status(201).json(buildAuthPayload(user));
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = normalizeText(req.body.email).toLowerCase();
    const password = normalizeText(req.body.password);

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email }).select('+passwordSalt +passwordHash');

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordHash = hashPassword(password, user.passwordSalt);
    if (passwordHash !== user.passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }

    res.json(buildAuthPayload(user));
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.sub);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  })
);

module.exports = router;