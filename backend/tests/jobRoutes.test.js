jest.mock('../src/models/JobRequest', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const JobRequest = require('../src/models/JobRequest');

describe('Job request API', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.USER_EMAIL = 'demo@tradeconnect.com';
    process.env.USER_PASSWORD = 'password123';
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

  test('requires a valid JWT to create a job', async () => {
    const loginToken = jwt.sign(
      { sub: 'demo@tradeconnect.com', email: 'demo@tradeconnect.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    JobRequest.create.mockResolvedValue({
      _id: 'job-1',
      title: 'New boiler service',
    });

    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${loginToken}`)
      .send({
        title: 'New boiler service',
        description: 'Annual boiler check',
        category: 'Plumbing',
        location: 'Glasgow',
        contactName: 'Sam',
        contactEmail: 'sam@example.com',
      });

    expect(response.status).toBe(201);
    expect(JobRequest.create).toHaveBeenCalled();
  });

  test('returns a JWT for valid login credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'demo@tradeconnect.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});