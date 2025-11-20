const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongod;

// Setup
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Cleanup
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('Verification email sent');
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123'
        });

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@test.com',
          password: 'password456'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'te', // Too short
          email: 'invalid-email',
          password: '123' // Too short
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      // Create and verify user
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: 'hashedpassword',
        isVerified: true
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login unverified user', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: 'hashedpassword',
        isVerified: false
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.msg).toContain('verify your email');
    });

    it('should not login with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: 'hashedpassword',
        isVerified: true
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@test.com'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toContain('Reset email sent');
    });

    it('should return error for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com'
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.msg).toBe('User not found');
    });
  });
});