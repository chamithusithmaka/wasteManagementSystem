import mongoose from 'mongoose';

const TRANSACTION_TYPES = Object.freeze(['CREDIT', 'DEBIT']);
const TRANSACTION_REF_TYPES = Object.freeze(['wallet', 'bill', 'reward']);
const TRANSACTION_PAYMENT_METHODS = Object.freeze(['wallet', 'card', 'bank', 'reward']);
const TRANSACTION_STATUSES = Object.freeze(['pending', 'completed', 'failed']);

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: TRANSACTION_TYPES,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  note: {
    type: String,
    default: ''
  },
  refType: {
    type: String,
    enum: TRANSACTION_REF_TYPES,
    required: true
  },
  refId: {
    type: String,
    default: null
  },
  walletBalanceAfter: {
    type: Number,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: TRANSACTION_PAYMENT_METHODS,
    required: true
  },
  status: {
    type: String,
    enum: TRANSACTION_STATUSES,
    default: 'completed'
  }
}, {
  timestamps: true
});

// Instance method: update status
transactionSchema.methods.updateStatus = function(newStatus) {
  if (TRANSACTION_STATUSES.includes(newStatus)) {
    this.status = newStatus;
    return this.save();
  }
  throw new Error('Invalid transaction status');
};

// Static helper: create a transaction with balance calculation
transactionSchema.statics.createWithBalance = async function(data, walletBalance) {
  return this.create({
    ...data,
    walletBalanceAfter: walletBalance
  });
};

// Clean JSON output
transactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

transactionSchema.index({ userId: 1, createdAt: -1 });

export {
  TRANSACTION_TYPES,
  TRANSACTION_REF_TYPES,
  TRANSACTION_PAYMENT_METHODS,
  TRANSACTION_STATUSES
};
export default mongoose.model('Transaction', transactionSchema);