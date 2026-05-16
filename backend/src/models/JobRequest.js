const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    contactName: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Contact email must be valid'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    ownerName: {
      type: String,
      trim: true,
      default: '',
    },
    ownerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobRequest', jobRequestSchema);
