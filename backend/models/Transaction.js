import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  note: String,
  refType: {
    type: String,
    enum: ['wallet', 'bill', 'reward'],
    required: true
  },
  refId: String,
  walletBalanceAfter: Number,
  paymentMethod: {
    type: String,
    enum: ['wallet', 'card', 'bank', 'reward'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

transactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Transaction', transactionSchema);