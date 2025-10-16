import BillService from '../services/billService.js';
import WasteCollection from '../models/WasteCollection.js';
import Wallet from '../models/Wallet.js';
// Import Transaction model
import Transaction from '../models/Transaction.js';

export const getUserBills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    
    const bills = await BillService.getUserBills(userId, { status });
    
    res.status(200).json({ bills });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve bills',
      error: err.message
    });
  }
};

export const getAllBills = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { status, userId, page, limit } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    
    const result = await BillService.getAllBills(
      filters, 
      parseInt(page || 1), 
      parseInt(limit || 20)
    );
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve bills',
      error: err.message
    });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const bill = await BillService.getBillById(id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Check authorization (user's own bill or admin)
    if (bill.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this bill' });
    }
    
    res.status(200).json({ bill });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve bill',
      error: err.message
    });
  }
};

export const payBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, applyRewards = false } = req.body;
    const userId = req.user._id;
    
    // Get the bill
    const bill = await BillService.getBillById(id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Check authorization
    if (bill.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay this bill' });
    }
    
    // Check if already paid
    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }
    
    // Calculate amount to pay after applying rewards if requested
    let amountToPay = bill.amount;
    let appliedRewards = [];
    
    // Apply rewards if requested
    if (applyRewards) {
      // Find available rewards for this user
      const availableRewards = await Reward.find({ 
        residentId: userId.toString(),
        used: { $ne: true } // Only get unused rewards
      }).sort({ date: 1 }); // Use oldest rewards first
      
      let remainingAmount = amountToPay;
      
      // Apply rewards until bill is paid or no more rewards available
      for (const reward of availableRewards) {
        if (remainingAmount <= 0) break;
        
        const amountToApply = Math.min(reward.amount, remainingAmount);
        remainingAmount -= amountToApply;
        
        // Mark reward as used (partially or fully)
        reward.used = true;
        reward.usedAmount = amountToApply;
        reward.usedDate = new Date();
        reward.usedFor = `Bill payment: ${bill.invoiceNumber || bill._id}`;
        await reward.save();
        
        appliedRewards.push({
          rewardId: reward._id,
          amount: amountToApply,
          type: reward.type,
          label: reward.label
        });
      }
      
      // Update amount to pay after applying rewards
      amountToPay = remainingAmount > 0 ? remainingAmount : 0;
    }
    
    // If paying with wallet, check balance
    if (paymentMethod === 'wallet' && amountToPay > 0) {
      // Find user's wallet
      const wallet = await Wallet.findOne({ residentId: userId.toString() });
      
      if (!wallet || wallet.balance < amountToPay) {
        return res.status(400).json({ 
          message: 'Insufficient wallet balance',
          currentBalance: wallet?.balance || 0,
          requiredAmount: amountToPay
        });
      }
      
      // Deduct from wallet
      wallet.balance -= amountToPay;
      wallet.transactions.unshift({
        txnId: 'TXN' + Date.now(),
        type: 'DEBIT',
        amount: amountToPay,
        note: `Payment for ${bill.title}`,
        refType: 'bill',
        refId: bill._id.toString(),
        createdAt: new Date(),
      });
      
      await wallet.save();
      
      // Create proper transaction record
      await Transaction.create({
        userId,
        type: 'DEBIT',
        amount: amountToPay,
        note: `Wallet payment for ${bill.title}`,
        refType: 'bill',
        refId: bill._id.toString(),
        walletBalanceAfter: wallet.balance,
        paymentMethod: 'wallet',
        status: 'completed'
      });
    } else if (amountToPay > 0) {
      // For other payment methods, create a transaction record
      let wallet = await Wallet.findOne({ residentId: userId.toString() });
      const currentBalance = wallet?.balance || 0;
      
      if (!wallet) {
        wallet = new Wallet({
          residentId: userId.toString(),
          balance: 0
        });
        await wallet.save();
      }
      
      await Transaction.create({
        userId,
        type: 'DEBIT',
        amount: amountToPay,
        note: `${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} payment for ${bill.title}`,
        refType: 'bill',
        refId: bill._id.toString(),
        walletBalanceAfter: currentBalance,
        paymentMethod,
        status: 'completed'
      });
    }
    
    // Mark bill as paid
    const paidBill = await BillService.markBillAsPaid(id, {
      method: paymentMethod,
      reference: `PAY-${Date.now()}`
    });
    
    res.status(200).json({
      message: 'Bill paid successfully',
      bill: paidBill,
      appliedRewards: appliedRewards,
      finalAmount: amountToPay
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to pay bill',
      error: err.message
    });
  }
};

export const checkOutstandingBills = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const hasOutstanding = await BillService.hasOutstandingBills(userId);
    const outstandingBalance = hasOutstanding ? 
      await BillService.getOutstandingBalance(userId) : 0;
    
    res.status(200).json({
      hasOutstandingBills: hasOutstanding,
      outstandingBalance
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to check outstanding bills',
      error: err.message
    });
  }
};

// Admin-only: Generate bill for a completed waste collection
export const generateBill = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { collectionId } = req.params;
    
    // Get the waste collection
    const collection = await WasteCollection.findById(collectionId);
    
    if (!collection) {
      return res.status(404).json({ message: 'Waste collection not found' });
    }
    
    if (collection.status !== 'Completed') {
      return res.status(400).json({ 
        message: 'Cannot generate bill for collection that is not completed'
      });
    }
    
    // Check if bill already exists
    const existingBill = await Bill.findOne({ collectionId: collection._id });
    if (existingBill) {
      return res.status(400).json({ 
        message: 'Bill already exists for this collection',
        billId: existingBill._id
      });
    }
    
    // Create bill
    const bill = await BillService.createBill(collection, req.user.username);
    
    res.status(201).json({
      message: 'Bill generated successfully',
      bill
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to generate bill',
      error: err.message
    });
  }
};

export const payMultipleBills = async (req, res) => {
  try {
    const { billIds, paymentMethod, useWalletFirst = true, applyRewards = true } = req.body;
    const userId = req.user._id;
    
    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return res.status(400).json({ message: 'No bills specified for payment' });
    }
    
    // Get the bills
    const bills = await Promise.all(billIds.map(id => BillService.getBillById(id)));
    
    // Verify all bills exist and belong to the user
    for (const bill of bills) {
      if (!bill) {
        return res.status(404).json({ message: 'One or more bills not found' });
      }
      
      if (bill.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to pay one or more bills' });
      }
      
      if (bill.status === 'paid') {
        return res.status(400).json({ message: 'One or more bills are already paid' });
      }
    }
    
    // Calculate total amount to pay
    let totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    let amountToPay = totalAmount;
    let appliedRewards = [];
    const deductions = [];
    
    // Apply rewards if requested
    if (applyRewards) {
      // Find available rewards for this user
      const availableRewards = await Reward.find({ 
        residentId: userId.toString(),
        used: { $ne: true } // Only get unused rewards
      }).sort({ date: 1 }); // Use oldest rewards first
      
      let remainingAmount = amountToPay;
      
      // Apply rewards until bills are paid or no more rewards available
      for (const reward of availableRewards) {
        if (remainingAmount <= 0) break;
        
        const amountToApply = Math.min(reward.amount, remainingAmount);
        remainingAmount -= amountToApply;
        
        // Mark reward as used
        reward.used = true;
        reward.usedAmount = amountToApply;
        reward.usedDate = new Date();
        reward.usedFor = `Multiple bills payment: ${billIds.join(', ')}`;
        await reward.save();
        
        appliedRewards.push({
          rewardId: reward._id,
          amount: amountToApply,
          type: reward.type,
          label: reward.label
        });
        
        deductions.push({
          description: `${reward.label} Reward`,
          amount: amountToApply
        });
      }
      
      // Update amount to pay after applying rewards
      amountToPay = remainingAmount > 0 ? remainingAmount : 0;
    }
    
    // Payment processing
    if (amountToPay > 0) {
      if (useWalletFirst) {
        // Try to use wallet first
        const wallet = await Wallet.findOne({ residentId: userId.toString() });
        
        if (wallet && wallet.balance > 0) {
          const walletAmount = Math.min(wallet.balance, amountToPay);
          amountToPay -= walletAmount;
          
          // Deduct from wallet
          wallet.balance -= walletAmount;
          wallet.transactions.unshift({
            txnId: 'TXN' + Date.now(),
            type: 'DEBIT',
            amount: walletAmount,
            note: `Payment for multiple bills`,
            refType: 'multiple-bills',
            refId: billIds.join(','),
            createdAt: new Date(),
          });
          
          await wallet.save();
          
          // Add wallet payment to deductions
          deductions.push({
            description: 'Wallet Balance',
            amount: walletAmount
          });
          
          // Create transaction record for wallet portion
          await Transaction.create({
            userId,
            type: 'DEBIT',
            amount: walletAmount,
            note: `Wallet payment for multiple bills`,
            refType: 'multiple-bills',
            refId: billIds.join(','),
            walletBalanceAfter: wallet.balance,
            paymentMethod: 'wallet',
            status: 'completed'
          });
        }
      }
    }
    
    // If there's still amount to pay, use the selected payment method
    if (amountToPay > 0) {
      // Create transaction for the remaining amount
      await Transaction.create({
        userId,
        type: 'DEBIT',
        amount: amountToPay,
        note: `${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} payment for multiple bills`,
        refType: 'multiple-bills',
        refId: billIds.join(','),
        walletBalanceAfter: await Wallet.findOne({ residentId: userId.toString() }).then(w => w?.balance || 0),
        paymentMethod,
        status: 'completed'
      });
    }
    
    // Mark all bills as paid
    for (const bill of bills) {
      await BillService.markBillAsPaid(bill._id, {
        method: paymentMethod,
        reference: `MULTI-PAY-${Date.now()}`
      });
    }
    
    res.status(200).json({
      message: 'Bills paid successfully',
      totalBilled: totalAmount,
      deductions: deductions,
      totalPaid: amountToPay,
      appliedRewards: appliedRewards,
      paymentMethod: amountToPay > 0 ? paymentMethod : 'rewards',
      reference: `MULTI-PAY-${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to pay bills',
      error: err.message
    });
  }
};