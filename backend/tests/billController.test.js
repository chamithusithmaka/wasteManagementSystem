import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import User from '../models/User.js';

// Mock user authentication middleware for tests
const testUserId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  // Create a test user
  await User.create({ _id: testUserId, name: 'Test User', email: 'test@example.com' });
});

afterAll(async () => {
  await Bill.deleteMany({ userId: testUserId });
  await User.deleteOne({ _id: testUserId });
  await mongoose.connection.close();
});

describe('Bill Controller', () => {
  let testBillId;

  it('should create a new bill', async () => {
    const billData = {
      userId: testUserId,
      collectionId: new mongoose.Types.ObjectId(),
      title: 'Test Bill',
      amount: 100,
      dueDate: new Date(),
      createdBy: 'test'
    };
    const bill = await Bill.create(billData);
    testBillId = bill._id;
    expect(bill.title).toBe('Test Bill');
    expect(bill.amount).toBe(100);
  });

  it('should get user bills', async () => {
    const res = await request(app)
      .get('/api/bills/my-bills')
      .set('Authorization', `Bearer testtoken`)
      .query({ status: 'due' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.bills)).toBe(true);
  });

  it('should check outstanding bills', async () => {
    const res = await request(app)
      .get('/api/bills/check-outstanding')
      .set('Authorization', `Bearer testtoken`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('hasOutstandingBills');
    expect(res.body).toHaveProperty('outstandingBalance');
  });

  it('should get current month bills', async () => {
    const now = new Date();
    const res = await request(app)
      .get('/api/bills/current-month')
      .set('Authorization', `Bearer testtoken`)
      .query({ month: now.getUTCMonth(), year: now.getUTCFullYear() });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.bills)).toBe(true);
    expect(res.body).toHaveProperty('totalPayable');
  });
});