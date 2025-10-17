import mongoose from 'mongoose';
import Bill from '../models/Bill.js';

describe('Bill Model', () => {
  afterEach(async () => {
    await Bill.deleteMany({});
  });

  it('should create a bill and generate invoice number', async () => {
    const bill = await Bill.create({
      userId: new mongoose.Types.ObjectId(),
      collectionId: new mongoose.Types.ObjectId(),
      title: 'Test Bill',
      amount: 150,
      dueDate: new Date(),
      createdBy: 'test'
    });
    expect(bill.invoiceNumber).toMatch(/^INV-/);
    expect(bill.status).toBe('due');
  });

  it('should create a bill with tags', async () => {
    const bill = await Bill.create({
      userId: new mongoose.Types.ObjectId(),
      collectionId: new mongoose.Types.ObjectId(),
      title: 'Tagged Bill',
      amount: 200,
      dueDate: new Date(),
      tags: ['recyclable', 'monthly'],
      createdBy: 'test'
    });
    expect(bill.tags.length).toBe(2);
    expect(bill.tags).toContain('recyclable');
  });

  it('should update bill status to paid', async () => {
    const bill = await Bill.create({
      userId: new mongoose.Types.ObjectId(),
      collectionId: new mongoose.Types.ObjectId(),
      title: 'Status Test Bill',
      amount: 75,
      dueDate: new Date(),
      createdBy: 'test'
    });
    bill.status = 'paid';
    await bill.save();
    expect(bill.status).toBe('paid');
  });

  it('should store and retrieve notes', async () => {
    const bill = await Bill.create({
      userId: new mongoose.Types.ObjectId(),
      collectionId: new mongoose.Types.ObjectId(),
      title: 'Notes Test Bill',
      amount: 125,
      dueDate: new Date(),
      notes: 'This is a test note',
      createdBy: 'test'
    });
    expect(bill.notes).toBe('This is a test note');
  });

  it('should have default empty tags array', async () => {
    const bill = await Bill.create({
      userId: new mongoose.Types.ObjectId(),
      collectionId: new mongoose.Types.ObjectId(),
      title: 'No Tags Bill',
      amount: 50,
      dueDate: new Date(),
      createdBy: 'test'
    });
    expect(Array.isArray(bill.tags)).toBe(true);
    expect(bill.tags.length).toBe(0);
  });
});