const express = require('express');
const mongoose = require('mongoose');
const JobRequest = require('../models/JobRequest');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const allowedStatuses = ['Open', 'In Progress', 'Closed'];

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildSearchFilter(query) {
  const filter = {};
  const searchTerm = normalizeText(query.q);

  if (query.category) {
    filter.category = query.category;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  return filter;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = buildSearchFilter(req.query);
    const jobs = await JobRequest.find(filter).sort({ createdAt: -1 });
    res.json({ data: jobs });
  })
);

router.get(
  '/mine',
  requireAuth,
  requireRole('homeowner'),
  asyncHandler(async (req, res) => {
    const jobs = await JobRequest.find({ ownerId: req.user.sub }).sort({ createdAt: -1 });
    res.json({ data: jobs });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Job request not found', 404);
    }

    const job = await JobRequest.findById(req.params.id);

    if (!job) {
      throw new AppError('Job request not found', 404);
    }

    res.json({ data: job });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('homeowner'),
  asyncHandler(async (req, res) => {
    const title = normalizeText(req.body.title);
    const description = normalizeText(req.body.description);
    const category = normalizeText(req.body.category);
    const location = normalizeText(req.body.location);
    const contactName = normalizeText(req.body.contactName);
    const contactEmail = normalizeText(req.body.contactEmail).toLowerCase();

    const missingFields = [];

    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!contactEmail) missingFields.push('contactEmail');

    if (missingFields.length > 0) {
      throw new AppError('Missing required fields', 400, { missingFields });
    }

    if (!/^\S+@\S+\.\S+$/.test(contactEmail)) {
      throw new AppError('Contact email must be valid', 400);
    }

    const job = await JobRequest.create({
      title,
      description,
      category,
      location,
      contactName,
      contactEmail,
      ownerId: req.user.sub,
      ownerName: req.user.name || contactName,
      ownerEmail: req.user.email || contactEmail,
    });

    res.status(201).json({ data: job });
  })
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('tradesperson'),
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Job request not found', 404);
    }

    const status = normalizeText(req.body.status);

    if (!allowedStatuses.includes(status)) {
      throw new AppError('Status must be Open, In Progress, or Closed', 400);
    }

    const updatedJob = await JobRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      throw new AppError('Job request not found', 404);
    }

    res.json({ data: updatedJob });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('homeowner'),
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Job request not found', 404);
    }

    const existingJob = await JobRequest.findById(req.params.id);

    if (!existingJob) {
      throw new AppError('Job request not found', 404);
    }

    if (!existingJob.ownerId || existingJob.ownerId.toString() !== req.user.sub) {
      throw new AppError('You can only delete your own jobs', 403);
    }

    const deletedJob = await JobRequest.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      throw new AppError('Job request not found', 404);
    }

    res.status(204).send();
  })
);

module.exports = router;
