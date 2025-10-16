import Transaction from '../models/Transaction.js';
import TransactionService from '../services/transactionService.js';
import { sendEmail } from '../utils/sendEmail.js';


export const getUserTransactions = async (req, res) => {
  try {
    const { limit } = req.query;
    const transactions = await TransactionService.getUserTransactions(
      req.user._id,
      parseInt(limit) || 10
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createWalletTopup = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const { transaction, wallet } = await TransactionService.processWalletTopup(
      userId,
      amount,
      paymentMethod || 'card'
    );

    res.status(201).json({
      message: 'Wallet topped up successfully',
      transaction,
      newBalance: wallet.balance
    });
  } catch (err) {
    console.error('Wallet topup error:', err);
    res.status(500).json({ 
      message: 'Failed to process wallet top-up',
      error: err.message 
    });
  }
};

export const sendReceiptEmail = async (req, res) => {
  try {
    const { email, receipt } = req.body;
    
    if (!email || !receipt) {
      return res.status(400).json({ message: 'Email address and receipt details are required' });
    }
    
    console.log('Sending receipt email to:', email);
    
    // Format functions
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatCurrency = (amount) => {
      return `LKR ${amount.toFixed(2)}`;
    };

    // Generate items rows
    const itemsRows = receipt.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.amount)}</td>
      </tr>
    `).join('');

    // Generate deductions rows if any
    const deductionsRows = (receipt.deductions || []).map(deduction => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${deduction.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #10B981;">-${formatCurrency(deduction.amount)}</td>
      </tr>
    `).join('');

    // Generate taxes rows if any
    const taxesRows = (receipt.taxes || []).map(tax => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${tax.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(tax.amount)}</td>
      </tr>
    `).join('');

    // Generate HTML directly in the controller
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { max-width: 150px; height: auto; }
          .receipt-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
          .receipt-status { display: flex; align-items: center; margin-bottom: 20px; }
          .receipt-circle { width: 40px; height: 40px; border-radius: 50%; background-color: #f0fdf4; text-align: center; line-height: 40px; }
          .receipt-status-text { margin-left: 15px; }
          .receipt-table { width: 100%; border-collapse: collapse; }
          .receipt-footer { margin-top: 20px; font-size: 14px; color: #64748b; text-align: center; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Payment Receipt</h2>
            <p>UrbanWasteX</p>
          </div>
          
          <div class="receipt-box">
            <div class="receipt-status">
              <div class="receipt-circle">✓</div>
              <div class="receipt-status-text">
                <h3 style="margin: 0; color: #10B981;">Payment Successful</h3>
                <p style="margin: 0; color: #64748b;">${formatDate(receipt.date)}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p><strong>Receipt #:</strong> ${receipt.reference}</p>
              <p><strong>Transaction ID:</strong> ${receipt.idempotencyKey ? receipt.idempotencyKey.substring(0, 8) : 'N/A'}</p>
            </div>
            
            <div style="margin-bottom: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <h4 style="margin: 0 0 10px 0;">Payer Details</h4>
              <p style="margin: 0;">${receipt.payer.name}</p>
              <p style="margin: 0; color: #64748b;">ID: ${receipt.payer.id}</p>
              ${receipt.payer.email ? `<p style="margin: 0; color: #64748b;">Email: ${receipt.payer.email}</p>` : ''}
              ${receipt.payer.address ? `<p style="margin: 0; color: #64748b;">${receipt.payer.address}</p>` : ''}
            </div>
            
            <div style="margin-bottom: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <h4 style="margin: 0 0 10px 0;">Items</h4>
              <table class="receipt-table">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid #e2e8f0;">Description</th>
                    <th style="text-align: right; padding: 8px; border-bottom: 2px solid #e2e8f0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                  ${deductionsRows ? `
                    <tr><td colspan="2" style="padding-top: 10px;"><strong>Deductions</strong></td></tr>
                    ${deductionsRows}
                  ` : ''}
                  ${taxesRows ? `
                    <tr><td colspan="2" style="padding-top: 10px;"><strong>Taxes</strong></td></tr>
                    ${taxesRows}
                  ` : ''}
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td style="padding: 15px 8px 8px; text-align: left;">Total</td>
                    <td style="padding: 15px 8px 8px; text-align: right;">${formatCurrency(receipt.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="margin-bottom: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              <h4 style="margin: 0 0 10px 0;">Payment Method</h4>
              <p style="margin: 0;">${receipt.paymentMethod}</p>
            </div>
          </div>
          
          <div class="receipt-footer">
            <p>Thank you for choosing UrbanWasteX for your waste management needs.</p>
            <p>This is an automatically generated receipt.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send the email with hardcoded credentials
    const result = await sendEmail({
      to: email,
      subject: `Receipt: ${receipt.reference}`,
      text: `Your receipt ${receipt.reference} for ${receipt.total} LKR is attached.`,
      html
    });
    
    console.log('Email sent result:', result);
    res.json({ success: true, message: 'Receipt sent successfully to ' + email });
  } catch (err) {
    console.error('Error sending receipt:', err);
    res.status(500).json({ message: 'Failed to send receipt', error: err.message });
  }
};