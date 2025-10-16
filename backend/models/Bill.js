import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WasteCollection',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['due', 'overdue', 'paid', 'cancelled'],
    default: 'due'
  },
  invoiceNumber: {
    type: String,
    unique: true
  },
  paymentDate: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'card', 'bank', null],
    default: null
  },
  paymentReference: {
    type: String,
    default: null
  },
  tags: [{
    type: String
  }],
  notes: {
    type: String
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Generate invoice number before saving
billSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    const prefix = 'INV';
    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Check if a bill is overdue and update status
billSchema.methods.checkIfOverdue = function() {
  if (this.status === 'due' && new Date() > this.dueDate) {
    this.status = 'overdue';
    return true;
  }
  return false;
};

// Index for efficient querying
billSchema.index({ status: 1 });
billSchema.index({ dueDate: 1 });

const Bill = mongoose.model('Bill', billSchema);

export default Bill;