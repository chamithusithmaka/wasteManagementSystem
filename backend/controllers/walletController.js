import Wallet from '../models/Wallet.js';
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
    const { amount, method = 'manual', email } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    let wallet = await Wallet.findOne({ residentId: req.params.residentId });
    if (!wallet) {
      wallet = new Wallet({
        residentId: req.params.residentId,
        balance: 0,
        transactions: [],
        email: email // use provided or fallback
      });
    }
    wallet.balance += amount;
    wallet.email = email || wallet.email; // always update email if provided
    wallet.transactions.unshift({
      txnId: 'TXN' + Date.now(),
      type: 'CREDIT',
      amount,
      note: `Top-up via ${method}`,
      createdAt: new Date(),
    });
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

export const emailReceipt = async (req, res) => {
  try {
    const { email, receipt } = req.body;
    if (!email || !receipt) return res.status(400).json({ message: "Missing email or receipt" });

    // Nodemailer transporter (directly in controller)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Simple HTML for the receipt
    const html = `
      <h2>UrbanWasteX Payment Receipt</h2>
      <p><b>Receipt #:</b> ${receipt.reference}</p>
      <p><b>Date:</b> ${new Date(receipt.date).toLocaleString()}</p>
      <p><b>Payer:</b> ${receipt.payer.name} (${receipt.payer.email})</p>
      <p><b>Items:</b></p>
      <ul>
        ${receipt.items.map(item => `<li>${item.description}: LKR ${item.amount.toFixed(2)}</li>`).join('')}
      </ul>
      <p><b>Total:</b> LKR ${receipt.total.toFixed(2)}</p>
      <p><b>Payment Method:</b> ${receipt.paymentMethod}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your UrbanWasteX Payment Receipt',
      text: `Receipt #${receipt.reference} - Total: LKR ${receipt.total}`,
      html,
    });

    res.json({ message: "Receipt sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};