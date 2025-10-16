import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js'; // Add this import
import TransactionService from '../services/transactionService.js';
import nodemailer from 'nodemailer';

// Get wallet by residentId
export const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ residentId: req.params.residentId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add funds to wallet
export const addFunds = async (req, res) => {
  try {
    console.log('Adding funds:', req.body);
    const { amount } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ residentId: userId.toString() });
    if (!wallet) {
      wallet = new Wallet({
        residentId: userId.toString(),
        balance: 0
      });
    }

    // Create transaction using Transaction model
    const transaction = new Transaction({
      userId: userId,
      type: 'CREDIT',
      amount: amount,
      note: 'Wallet Top-up',
      refType: 'wallet',
      refId: wallet._id.toString(),
      walletBalanceAfter: wallet.balance + amount,
      paymentMethod: 'card',
      status: 'completed'
    });

    // Update wallet balance
    wallet.balance += amount;

    // Save both wallet and transaction
    await Promise.all([
      wallet.save(),
      transaction.save()
    ]);

    console.log('Wallet updated:', wallet);
    console.log('Transaction created:', transaction);

    res.status(200).json({
      message: 'Funds added successfully',
      transaction,
      newBalance: wallet.balance
    });
  } catch (err) {
    console.error('Add funds error:', err);
    res.status(500).json({ 
      message: 'Failed to add funds',
      error: err.message 
    });
  }
};

// Get wallet transactions
export const getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ residentId: req.params.residentId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet.transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recent N transactions for a resident
export const getRecentTransactions = async (req, res) => {
  try {
    const { residentId } = req.params;
    const limit = parseInt(req.query.limit) || 5; // default 5
    const wallet = await Wallet.findOne({ residentId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    // Sort by createdAt descending and limit
    const recent = wallet.transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const emailReceipt = async (req, res) => {
//   try {
//     const { email, receipt } = req.body;
//     if (!email || !receipt) return res.status(400).json({ message: "Missing email or receipt" });

//     // Nodemailer transporter (directly in controller)
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // Simple HTML for the receipt
//     const html = `
//       <h2>UrbanWasteX Payment Receipt</h2>
//       <p><b>Receipt #:</b> ${receipt.reference}</p>
//       <p><b>Date:</b> ${new Date(receipt.date).toLocaleString()}</p>
//       <p><b>Payer:</b> ${receipt.payer.name} (${receipt.payer.email})</p>
//       <p><b>Items:</b></p>
//       <ul>
//         ${receipt.items.map(item => `<li>${item.description}: LKR ${item.amount.toFixed(2)}</li>`).join('')}
//       </ul>
//       <p><b>Total:</b> LKR ${receipt.total.toFixed(2)}</p>
//       <p><b>Payment Method:</b> ${receipt.paymentMethod}</p>
//     `;

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Your UrbanWasteX Payment Receipt',
//       text: `Receipt #${receipt.reference} - Total: LKR ${receipt.total}`,
//       html,
//     });

//     res.json({ message: "Receipt sent to email" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Get wallet for the authenticated user
export const getMyWallet = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find wallet for the current user
    let wallet = await Wallet.findOne({ residentId: userId.toString() });
    
    // If wallet doesn't exist, create one
    if (!wallet) {
      wallet = new Wallet({
        residentId: userId.toString(),
        balance: 0
      });
      await wallet.save();
    }
    
    res.status(200).json(wallet);
  } catch (err) {
    console.error('Error getting wallet:', err);
    res.status(500).json({ message: 'Failed to retrieve wallet', error: err.message });
  }
};