import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';

class TransactionService {
  static async createTransaction(data) {
    const transaction = new Transaction(data);
    await transaction.save();
    return transaction;
  }

  static async getUserTransactions(userId, limit = 10) {
    return await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async processWalletTopup(userId, amount, paymentMethod) {
    const wallet = await Wallet.findOne({ residentId: userId.toString() });
    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance + amount;

    const transaction = await this.createTransaction({
      userId,
      type: 'CREDIT',
      amount,
      note: 'Wallet Top-up',
      refType: 'wallet',
      refId: wallet._id,
      walletBalanceAfter: newBalance,
      paymentMethod
    });

    wallet.balance = newBalance;
    await wallet.save();

    return { transaction, wallet };
  }

  static async processBillPayment(userId, billId, amount, paymentMethod) {
    const wallet = await Wallet.findOne({ residentId: userId.toString() });
    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance - amount;
    if (newBalance < 0) throw new Error('Insufficient balance');

    const transaction = await this.createTransaction({
      userId,
      type: 'DEBIT',
      amount,
      note: 'Bill Payment',
      refType: 'bill',
      refId: billId,
      walletBalanceAfter: newBalance,
      paymentMethod
    });

    wallet.balance = newBalance;
    await wallet.save();

    return { transaction, wallet };
  }

  static async processBillPayment(userId, billId, billTitle, amount, paymentMethod) {
    try {
      // Find or create wallet
      let wallet = await Wallet.findOne({ residentId: userId.toString() });
      if (!wallet) {
        wallet = new Wallet({
          residentId: userId.toString(),
          balance: 0
        });
        await wallet.save();
      }
      
      let walletBalanceAfter = wallet.balance;
      
      // If wallet payment, deduct from wallet
      if (paymentMethod === 'wallet') {
        if (wallet.balance < amount) {
          throw new Error('Insufficient wallet balance');
        }
        
        wallet.balance -= amount;
        walletBalanceAfter = wallet.balance;
        await wallet.save();
      }
      
      // Create transaction record
      const transaction = new Transaction({
        userId,
        type: 'DEBIT',
        amount,
        note: `${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} payment for ${billTitle}`,
        refType: 'bill',
        refId: billId,
        walletBalanceAfter,
        paymentMethod,
        status: 'completed'
      });
      
      await transaction.save();
      
      return { transaction, wallet };
    } catch (error) {
      console.error('Process bill payment error:', error);
      throw error;
    }
  }
}

export default TransactionService;