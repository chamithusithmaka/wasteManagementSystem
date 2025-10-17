import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';

describe('Wallet Model', () => {
  afterEach(async () => {
    await Wallet.deleteMany({});
  });

  it('should create wallet with default values', async () => {
    const wallet = await Wallet.create({
      residentId: 'user123'
    });
    expect(wallet.balance).toBe(0);
    expect(wallet.currency).toBe('LKR');
    expect(wallet.transactions.length).toBe(0);
  });

  it('should create wallet with initial balance', async () => {
    const wallet = await Wallet.create({
      residentId: 'user456',
      balance: 500
    });
    expect(wallet.balance).toBe(500);
  });

  it('should add a transaction to wallet', async () => {
    const wallet = await Wallet.create({
      residentId: 'user789',
      balance: 100
    });
    
    await wallet.addTransaction({
      txnId: 'TXN1',
      type: 'CREDIT',
      amount: 50,
      note: 'Top up',
      createdAt: new Date()
    });
    
    expect(wallet.transactions.length).toBe(1);
    expect(wallet.transactions[0].amount).toBe(50);
  });

  it('should support USD currency', async () => {
    const wallet = await Wallet.create({
      residentId: 'usd-user',
      balance: 100,
      currency: 'USD'
    });
    expect(wallet.currency).toBe('USD');
  });

  it('should add multiple transactions', async () => {
    const wallet = await Wallet.create({
      residentId: 'multi-user',
      balance: 200
    });
    
    await wallet.addTransaction({
      txnId: 'TXN1',
      type: 'CREDIT',
      amount: 100,
      note: 'First credit',
      createdAt: new Date()
    });
    
    await wallet.addTransaction({
      txnId: 'TXN2',
      type: 'DEBIT',
      amount: 50,
      note: 'First debit',
      createdAt: new Date()
    });
    
    expect(wallet.transactions.length).toBe(2);
  });

  it('should update wallet balance', async () => {
    const wallet = await Wallet.create({
      residentId: 'balance-user',
      balance: 100
    });
    
    wallet.balance += 50;
    await wallet.save();
    
    expect(wallet.balance).toBe(150);
  });
});