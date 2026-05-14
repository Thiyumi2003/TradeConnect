require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const JobRequest = require('../src/models/JobRequest');

const jobs = [
  {
    title: 'Leaking tap',
    description: 'Kitchen tap dripping continuously and needs replacement washers.',
    category: 'Plumbing',
    location: 'Glasgow',
    contactName: 'Sarah Thompson',
    contactEmail: 'sarah@example.com',
    status: 'Open',
  },
  {
    title: 'Fuse box inspection',
    description: 'Lights flicker in the hallway and a fuse box check is needed.',
    category: 'Electrical',
    location: 'Edinburgh',
    contactName: 'Mark Evans',
    contactEmail: 'mark@example.com',
    status: 'In Progress',
  },
  {
    title: 'Hall repaint',
    description: 'Small hall and stairs repaint after moving into the property.',
    category: 'Painting',
    location: 'Paisley',
    contactName: 'Aisha Khan',
    contactEmail: 'aisha@example.com',
    status: 'Open',
  },
  {
    title: 'Broken wardrobe door',
    description: 'Sliding wardrobe door has come off the rail and needs repair.',
    category: 'Joinery',
    location: 'Dundee',
    contactName: 'Liam Brown',
    contactEmail: 'liam@example.com',
    status: 'Closed',
  },
  {
    title: 'Boiler service',
    description: 'Annual boiler service and safety check requested before winter.',
    category: 'Plumbing',
    location: 'Aberdeen',
    contactName: 'Emma Wilson',
    contactEmail: 'emma@example.com',
    status: 'Open',
  },
];

async function seed() {
  await connectDB();
  await JobRequest.deleteMany({});
  await JobRequest.insertMany(jobs);
  console.log('Seed complete');
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
