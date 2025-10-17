import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

describe('Transaction Model', () => {
  afterEach(async () => {
    await Transaction.deleteMany({});
  });

  it('should create a credit transaction', async () => {
    const txn = await Transaction.create({
      userId: new mongoose.Types.ObjectId(),
      type: 'CREDIT',
      amount: 100,
      note: 'Test credit',
      refType: 'wallet',
      refId: 'WALLET123',
      walletBalanceAfter: 200,
      paymentMethod: 'wallet',
      status: 'completed'
    });
    expect(txn.type).toBe('CREDIT');
    expect(txn.amount).toBe(100);
    expect(txn.status).toBe('completed');
  });

  it('should create a debit transaction', async () => {
    const txn = await Transaction.create({
      userId: new mongoose.Types.ObjectId(),
      type: 'DEBIT',
      amount: 50,
      note: 'Test debit',
      refType: 'bill',
      refId: 'BILL123',
      paymentMethod: 'card',
      status: 'completed'
    });
    expect(txn.type).toBe('DEBIT');
    expect(txn.amount).toBe(50);
  });

  it('should have default status as completed', async () => {
    const txn = await Transaction.create({
      userId: new mongoose.Types.ObjectId(),
      type: 'CREDIT',
      amount: 75,
      refType: 'wallet',
      refId: 'WALLET456',
      paymentMethod: 'bank'
    });
    expect(txn.status).toBe('completed');
  });

  it('should store transaction note', async () => {
    const txn = await Transaction.create({
      userId: new mongoose.Types.ObjectId(),
      type: 'CREDIT',
      amount: 150,
      note: 'Monthly reward',
      refType: 'reward',
      refId: 'REWARD789',
      paymentMethod: 'reward',
      status: 'completed'
    });
    expect(txn.note).toBe('Monthly reward');
  });

  it('should update transaction status', async () => {
    const txn = await Transaction.create({
      userId: new mongoose.Types.ObjectId(),
      type: 'CREDIT',
      amount: 100,
      refType: 'wallet',
      refId: 'WALLET999',
      paymentMethod: 'wallet',
      status: 'pending'
    });
    await txn.updateStatus('completed');
    expect(txn.status).toBe('completed');
  });
});