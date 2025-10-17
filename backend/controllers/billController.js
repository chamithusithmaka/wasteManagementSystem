import BillService from '../services/billService.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Bill from '../models/Bill.js';
import Reward from '../models/Reward.js';

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


//refactor payMultipleBills to use helper functions and reduce duplication
export const payMultipleBills = async (req, res) => {
  try {
    const { billIds, paymentMethod, useWalletFirst = true, applyRewards = true } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(billIds) || billIds.length === 0) {
      return res.status(400).json({ message: 'No bills specified for payment' });
    }

    // Fetch and validate bills
    const bills = await Promise.all(billIds.map(id => BillService.getBillById(id)));
    for (const bill of bills) {
      if (!bill) return res.status(404).json({ message: 'One or more bills not found' });
      if (bill.userId.toString() !== userId.toString())
        return res.status(403).json({ message: 'Not authorized to pay one or more bills' });
      if (bill.status === 'paid')
        return res.status(400).json({ message: 'One or more bills are already paid' });
    }

    let totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    let amountToPay = totalAmount;
    const deductions = [];
    const appliedRewards = [];

    // Apply rewards
    if (applyRewards) {
      const { remainingAmount, rewardsUsed, deductionList } = await applyUserRewards(userId, amountToPay, billIds);
      amountToPay = remainingAmount;
      appliedRewards.push(...rewardsUsed);
      deductions.push(...deductionList);
    }

    // Use wallet if requested
    if (useWalletFirst && amountToPay > 0) {
      const { remainingAmount, walletDeduction } = await applyWalletPayment(userId, amountToPay, billIds);
      amountToPay = remainingAmount;
      if (walletDeduction) deductions.push(walletDeduction);
    }

    // Use selected payment method for any remaining amount
    if (amountToPay > 0) {
      await createTransaction(userId, amountToPay, paymentMethod, billIds);
    }

    // Mark all bills as paid
    const reference = `MULTI-PAY-${Date.now()}`;
    await Promise.all(
      bills.map(bill =>
        BillService.markBillAsPaid(bill._id, { method: paymentMethod, reference })
      )
    );

    res.status(200).json({
      message: 'Bills paid successfully',
      totalBilled: totalAmount,
      deductions,
      totalPaid: amountToPay,
      appliedRewards,
      paymentMethod: amountToPay > 0 ? paymentMethod : 'rewards',
      reference
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to pay bills',
      error: err.message
    });
  }
};

// --- Helper functions ---

async function applyUserRewards(userId, amountToPay, billIds) {
  const rewards = await Reward.find({
    residentId: userId.toString(),
    used: { $ne: true }
  }).sort({ date: 1 });

  let remainingAmount = amountToPay;
  const rewardsUsed = [];
  const deductionList = [];

  for (const reward of rewards) {
    if (remainingAmount <= 0) break;
    const amountToApply = Math.min(reward.amount, remainingAmount);
    remainingAmount -= amountToApply;

    reward.used = true;
    reward.usedAmount = amountToApply;
    reward.usedDate = new Date();
    reward.usedFor = `Multiple bills payment: ${billIds.join(', ')}`;
    await reward.save();

    rewardsUsed.push({
      rewardId: reward._id,
      amount: amountToApply,
      type: reward.type,
      label: reward.label
    });

    deductionList.push({
      description: `${reward.label} Reward`,
      amount: amountToApply
    });
  }

  return { remainingAmount, rewardsUsed, deductionList };
}

async function applyWalletPayment(userId, amountToPay, billIds) {
  const wallet = await Wallet.findOne({ residentId: userId.toString() });
  if (!wallet || wallet.balance <= 0) return { remainingAmount: amountToPay };

  const walletAmount = Math.min(wallet.balance, amountToPay);
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

  return {
    remainingAmount: amountToPay - walletAmount,
    walletDeduction: {
      description: 'Wallet Balance',
      amount: walletAmount
    }
  };
}

async function createTransaction(userId, amount, paymentMethod, billIds) {
  await Transaction.create({
    userId,
    type: 'DEBIT',
    amount,
    note: `${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} payment for multiple bills`,
    refType: 'multiple-bills',
    refId: billIds.join(','),
    walletBalanceAfter: await Wallet.findOne({ residentId: userId.toString() }).then(w => w?.balance || 0),
    paymentMethod,
    status: 'completed'
  });
}

// Add the batchPayBills function (moved from routes file)
export const batchPayBills = async (req, res) => {
  try {
    const { billIds, paymentMethod, useWallet, applyRewards } = req.body;
    const userId = req.user._id;

    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return res.status(400).json({ message: 'No bill IDs provided' });
    }

    // Fetch and validate bills
    const bills = await Promise.all(billIds.map(id => Bill.findById(id)));
    for (const bill of bills) {
      if (!bill) return res.status(404).json({ message: 'One or more bills not found' });
      if (bill.userId.toString() !== userId.toString())
        return res.status(403).json({ message: 'Not authorized to pay one or more bills' });
      if (bill.status === 'paid')
        return res.status(400).json({ message: 'One or more bills are already paid' });
    }

    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    let remainingAmount = totalAmount;
    let walletDeducted = 0;
    let rewardsDeducted = 0;
    const deductions = [];

    // Wallet deduction
    if (useWallet) {
      walletDeducted = await batchWalletDeduction(userId, remainingAmount, billIds, bills.length);
      if (walletDeducted > 0) {
        deductions.push({ description: 'Wallet Balance', amount: walletDeducted });
        remainingAmount -= walletDeducted;
      }
    }

    // Rewards deduction
    if (applyRewards && remainingAmount > 0) {
      rewardsDeducted = await batchRewardsDeduction(userId, remainingAmount, billIds, bills.length);
      if (rewardsDeducted > 0) {
        deductions.push({ description: 'Rewards Applied', amount: rewardsDeducted });
        remainingAmount -= rewardsDeducted;
      }
    }

    // Remaining payment
    if (remainingAmount > 0) {
      await batchCreateTransaction(userId, remainingAmount, paymentMethod, billIds, bills.length);
    }

    // Mark bills as paid
    const paymentDate = new Date();
    const reference = `BATCH-${Date.now()}`;
    await Promise.all(
      bills.map(bill => {
        bill.status = 'paid';
        bill.paymentDate = paymentDate;
        bill.paymentMethod = paymentMethod;
        bill.paymentReference = reference;
        return bill.save();
      })
    );

    res.status(200).json({
      message: 'Bills paid successfully',
      paymentId: `PAY-${Date.now()}`,
      reference,
      totalBilled: totalAmount,
      deductions,
      totalPaid: totalAmount - remainingAmount,
      paymentMethod: remainingAmount > 0 ? paymentMethod :
        (walletDeducted > 0 && rewardsDeducted > 0) ? 'Wallet + Rewards' :
        (walletDeducted > 0) ? 'Wallet' : 'Rewards'
    });
  } catch (err) {
    console.error('Batch payment error:', err);
    res.status(500).json({
      message: 'Failed to pay bills',
      error: err.message
    });
  }
};

// --- Helper Functions ---

async function batchWalletDeduction(userId, amountToPay, billIds, billCount) {
  const wallet = await Wallet.findOne({ residentId: userId.toString() });
  if (!wallet || wallet.balance <= 0) return 0;

  const walletAmount = Math.min(wallet.balance, amountToPay);
  wallet.balance -= walletAmount;
  wallet.transactions.unshift({
    txnId: 'TXN' + Date.now(),
    type: 'DEBIT',
    amount: walletAmount,
    note: `Wallet payment for ${billCount} bills`,
    refType: 'bill',
    refId: billIds.join(','),
    createdAt: new Date(),
  });
  await wallet.save();

  await Transaction.create({
    userId,
    type: 'DEBIT',
    amount: walletAmount,
    note: `Wallet payment for ${billCount} bills`,
    refType: 'bill',
    refId: billIds.join(','),
    walletBalanceAfter: wallet.balance,
    paymentMethod: 'wallet',
    status: 'completed'
  });

  return walletAmount;
}

async function batchRewardsDeduction(userId, amountToPay, billIds, billCount) {
  const rewards = await Reward.find({ residentId: userId.toString() });
  const totalRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);
  if (totalRewards <= 0) return 0;

  const rewardsAmount = Math.min(totalRewards, amountToPay);

  await Transaction.create({
    userId,
    type: 'DEBIT',
    amount: rewardsAmount,
    note: `Rewards used for ${billCount} bills`,
    refType: 'bill',
    refId: billIds.join(','),
    walletBalanceAfter: 0,
    paymentMethod: 'reward',
    status: 'completed'
  });

  // Clear rewards
  await Reward.deleteMany({ residentId: userId.toString() });

  return rewardsAmount;
}

async function batchCreateTransaction(userId, amount, paymentMethod, billIds, billCount) {
  await Transaction.create({
    userId,
    type: 'DEBIT',
    amount,
    note: `${paymentMethod} payment for ${billCount} bills`,
    refType: 'bill',
    refId: billIds.join(','),
    paymentMethod,
    status: 'completed'
  });
}

export const getCurrentMonthBills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = getMonthYearParams(req);

    const { monthStart, monthEnd } = getMonthDateRange(year, month);

    // Debug
    console.log('userId from req:', userId);
    console.log('Month start:', monthStart.toISOString());
    console.log('Month end:', monthEnd.toISOString());

    const bills = await Bill.find({
      userId,
      status: 'due',
      dueDate: {
        $gte: monthStart,
        $lt: monthEnd
      }
    }).sort({ dueDate: 1 });

    const totalPayable = calculateTotalPayable(bills);

    res.status(200).json({ bills, totalPayable });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve current month bills',
      error: err.message
    });
  }
};

// --- Helper Functions ---

function getMonthYearParams(req) {
  // Allow optional query params for month/year, fallback to current UTC month/year
  const now = new Date();
  let month = req.query.month ? parseInt(req.query.month, 10) : now.getUTCMonth();
  let year = req.query.year ? parseInt(req.query.year, 10) : now.getUTCFullYear();
  return { month, year };
}

function getMonthDateRange(year, month) {
  // month is zero-based (0 = Jan, 11 = Dec)
  const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
  return { monthStart, monthEnd };
}

function calculateTotalPayable(bills) {
  return bills.reduce((sum, bill) => sum + bill.amount, 0);
}