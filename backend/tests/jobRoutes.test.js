jest.mock('../src/models/JobRequest', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

const crypto = require('crypto');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const JobRequest = require('../src/models/JobRequest');
const User = require('../src/models/User');

describe('TradeConnect API', () => {
  const jobId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('filters jobs by keyword search across title and description', async () => {
    const sortMock = jest.fn().mockResolvedValue([
      {
        _id: '1',
        title: 'Leaking tap',
        description: 'Kitchen tap dripping',
      },
    ]);

    JobRequest.find.mockReturnValue({ sort: sortMock });

    const response = await request(app).get('/api/jobs?q=tap');

    expect(response.status).toBe(200);
    expect(JobRequest.find).toHaveBeenCalledWith({
      $or: [
        { title: { $regex: 'tap', $options: 'i' } },
        { description: { $regex: 'tap', $options: 'i' } },
      ],
    });
    expect(response.body.data).toHaveLength(1);
  });

  test('public users cannot create jobs', async () => {
    const response = await request(app).post('/api/jobs').send({
      title: 'New boiler service',
      description: 'Annual boiler check',
      category: 'Plumbing',
      location: 'Glasgow',
      contactName: 'Sam',
      contactEmail: 'sam@example.com',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/authentication required/i);
  });

  test('homeowners can register and post jobs', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'user-1',
      name: 'Home Owner',
      email: 'home@example.com',
      role: 'homeowner',
    });

    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Home Owner',
      email: 'home@example.com',
      password: 'password123',
      role: 'homeowner',
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.token).toBeDefined();
    expect(registerResponse.body.user.role).toBe('homeowner');

    const homeownerToken = jwt.sign(
      {
        sub: 'user-1',
        email: 'home@example.com',
        name: 'Home Owner',
        role: 'homeowner',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    JobRequest.create.mockResolvedValue({
      _id: 'job-1',
      title: 'New boiler service',
    });

    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        title: 'New boiler service',
        description: 'Annual boiler check',
        category: 'Plumbing',
        location: 'Glasgow',
        contactName: 'Sam',
        contactEmail: 'sam@example.com',
      });

    expect(response.status).toBe(201);
    expect(JobRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New boiler service',
        ownerId: 'user-1',
        ownerName: 'Home Owner',
        ownerEmail: 'home@example.com',
      })
    );
  });

  test('tradespeople can update job status', async () => {
    const tradespersonToken = jwt.sign(
      {
        sub: 'trade-1',
        email: 'trade@example.com',
        name: 'Trade Person',
        role: 'tradesperson',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    JobRequest.findByIdAndUpdate.mockResolvedValue({
      _id: jobId,
      status: 'In Progress',
    });

    const response = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${tradespersonToken}`)
      .send({ status: 'In Progress' });

    expect(response.status).toBe(200);
    expect(JobRequest.findByIdAndUpdate).toHaveBeenCalled();
  });

  test('homeowners can delete only their own jobs', async () => {
    const homeownerToken = jwt.sign(
      {
        sub: 'user-1',
        email: 'home@example.com',
        name: 'Home Owner',
        role: 'homeowner',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    JobRequest.findById.mockResolvedValue({
      _id: jobId,
      ownerId: 'user-1',
    });
    JobRequest.findByIdAndDelete.mockResolvedValue({ _id: jobId });

    const response = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(204);
    expect(JobRequest.findByIdAndDelete).toHaveBeenCalledWith(jobId);
  });

  test('returns a token for valid login credentials', async () => {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync('password123', salt, 64).toString('hex');

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'user-1',
        name: 'Home Owner',
        email: 'home@example.com',
        role: 'homeowner',
        passwordSalt: salt,
        passwordHash,
      }),
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'home@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.role).toBe('homeowner');
  });
});
