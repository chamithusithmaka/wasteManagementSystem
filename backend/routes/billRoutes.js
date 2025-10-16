import express from 'express';
import {
  getUserBills,
  getAllBills,
  getBillById,
  payBill,
  checkOutstandingBills,
  generateBill,
  payMultipleBills
} from '../controllers/billController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Bill from '../models/Bill.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';
import Reward from '../models/Reward.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Add this batch-pay route
router.post('/batch-pay', async (req, res) => {
  try {
    console.log('Batch pay request:', req.body);
    const { billIds, paymentMethod, useWallet, applyRewards } = req.body;
    const userId = req.user._id;

    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return res.status(400).json({ message: 'No bill IDs provided' });
    }

    // Get all bills
    const bills = [];
    for (const billId of billIds) {
      const bill = await Bill.findById(billId);
      if (!bill) {
        return res.status(404).json({ message: `Bill ${billId} not found` });
      }
      if (bill.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to pay one or more bills' });
      }
      if (bill.status === 'paid') {
        return res.status(400).json({ message: `Bill ${billId} is already paid` });
      }
      bills.push(bill);
    }

    console.log(`Found ${bills.length} valid bills to pay`);

    // Calculate total amount
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    console.log('Total bill amount:', totalAmount);

    // Track payment sources
    let walletAmount = 0;
    let rewardsAmount = 0;
    let remainingAmount = totalAmount;
    const deductions = [];

    // Process payment with wallet if requested
    if (useWallet) {
      const wallet = await Wallet.findOne({ residentId: userId.toString() });
      if (wallet && wallet.balance > 0) {
        walletAmount = Math.min(wallet.balance, totalAmount);
        if (walletAmount > 0) {
          console.log(`Using ${walletAmount} from wallet`);
          
          // Deduct from wallet
          wallet.balance -= walletAmount;
          
          // Create transaction
          const transaction = new Transaction({
            userId,
            type: 'DEBIT',
            amount: walletAmount,
            note: `Wallet payment for ${bills.length} bills`,
            refType: 'bill',
            refId: billIds.join(','),
            walletBalanceAfter: wallet.balance,
            paymentMethod: 'wallet',
            status: 'completed'
          });
          
          await Promise.all([
            wallet.save(),
            transaction.save()
          ]);
          
          deductions.push({ 
            description: 'Wallet Balance', 
            amount: walletAmount 
          });
          
          remainingAmount -= walletAmount;
        }
      } else {
        console.log('No wallet found or wallet balance is zero');
      }
    }

    // Process rewards if requested and there's still an amount to pay
    if (applyRewards && remainingAmount > 0) {
      // Get user rewards
      const rewards = await Reward.find({ residentId: userId.toString() });
      const totalRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);
      
      if (totalRewards > 0) {
        rewardsAmount = Math.min(totalRewards, remainingAmount);
        console.log(`Using ${rewardsAmount} from rewards`);
        
        if (rewardsAmount > 0) {
          // Create transaction for rewards
          const transaction = new Transaction({
            userId,
            type: 'DEBIT',
            amount: rewardsAmount,
            note: `Rewards used for ${bills.length} bills`,
            refType: 'bill',
            refId: billIds.join(','),
            walletBalanceAfter: 0,
            paymentMethod: 'reward',
            status: 'completed'
          });
          
          await transaction.save();
          
          // Clear rewards
          await Reward.deleteMany({ residentId: userId.toString() });
          
          deductions.push({ 
            description: 'Rewards Applied', 
            amount: rewardsAmount 
          });
          
          remainingAmount -= rewardsAmount;
        }
      } else {
        console.log('No rewards found');
      }
    }

    // Process remaining amount with selected payment method
    if (remainingAmount > 0) {
      console.log(`Processing remaining ${remainingAmount} with ${paymentMethod}`);
      
      // Create transaction for the remaining amount
      const transaction = new Transaction({
        userId,
        type: 'DEBIT',
        amount: remainingAmount,
        note: `${paymentMethod} payment for ${bills.length} bills`,
        refType: 'bill',
        refId: billIds.join(','),
        paymentMethod,
        status: 'completed'
      });
      
      await transaction.save();
    }

    // Mark bills as paid
    const paymentDate = new Date();
    const reference = `BATCH-${Date.now()}`;
    
    for (const bill of bills) {
      bill.status = 'paid';
      bill.paymentDate = paymentDate;
      bill.paymentMethod = paymentMethod;
      bill.paymentReference = reference;
      await bill.save();
    }

    console.log('All bills marked as paid');

    // Return payment details
    res.status(200).json({
      message: 'Bills paid successfully',
      paymentId: `PAY-${Date.now()}`,
      reference,
      totalBilled: totalAmount,
      deductions,
      totalPaid: remainingAmount,
      paymentMethod: remainingAmount > 0 ? paymentMethod : 
                    (walletAmount > 0 && rewardsAmount > 0) ? 'Wallet + Rewards' :
                    (walletAmount > 0) ? 'Wallet' : 'Rewards'
    });
  } catch (err) {
    console.error('Batch payment error:', err);
    res.status(500).json({
      message: 'Failed to pay bills',
      error: err.message
    });
  }
});

// User routes
router.get('/my-bills', getUserBills);
router.get('/check-outstanding', checkOutstandingBills);
router.get('/:id', getBillById);
router.post('/:id/pay', payBill);
// Add this to your existing routes
router.post('/pay-multiple', payMultipleBills);

// Admin routes
router.get('/admin/all', getAllBills);
router.post('/admin/generate/:collectionId', generateBill);

// For testing - create a test bill (admin only)
router.post('/admin/create-test-bill', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { userId, amount, title, dueDate } = req.body;
    
    // Create simple bill
    const bill = new Bill({
      userId: userId,
      collectionId: new mongoose.Types.ObjectId(), // Dummy ID for test
      title: title || 'Test Bill',
      amount: amount || 25.00,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'due',
      tags: ['Test'],
      notes: 'Created for testing',
      createdBy: req.user.username || 'admin'
    });
    
    await bill.save();
    
    res.status(201).json({
      message: 'Test bill created successfully',
      bill
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to create test bill',
      error: err.message
    });
  }
});

export default router;