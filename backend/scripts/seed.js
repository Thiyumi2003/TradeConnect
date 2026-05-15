require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const JobRequest = require('../src/models/JobRequest');

const jobs = [
  {
    title: 'Leaking kitchen tap',
    description: 'Kitchen tap has been leaking continuously since yesterday evening. Water pressure seems normal but the tap won\'t stop dripping.',
    category: 'Plumbing',
    location: 'Glasgow',
    contactName: 'Sarah Thompson',
    contactEmail: 'sarah.thompson@example.com',
    status: 'Open',
    createdAt: new Date('2026-05-14T05:00:00.000Z'),
    updatedAt: new Date('2026-05-14T05:00:00.000Z'),
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

  const exactPostedTime = new Date('2026-05-14T05:00:00.000Z');
  await JobRequest.collection.updateOne(
    { title: 'Leaking kitchen tap' },
    {
      $set: {
        createdAt: exactPostedTime,
        updatedAt: exactPostedTime,
      },
    }
  );

  console.log('Seed complete');
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
