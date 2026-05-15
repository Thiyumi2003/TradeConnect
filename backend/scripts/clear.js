require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const JobRequest = require('../src/models/JobRequest');

async function clear() {
  try {
    await connectDB();
    const result = await JobRequest.deleteMany({});
    console.log(`Deleted ${result.deletedCount} jobs from database`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Clear failed:', error.message);
    process.exit(1);
  }
}

clear();
