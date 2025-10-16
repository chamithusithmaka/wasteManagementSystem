import mongoose from 'mongoose';

const wasteCollectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  wasteType: {
    type: String,
    enum: ['Recyclables', 'General Waste', 'Compost', 'Hazardous'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String, // Store as HH:MM format
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Pending'],
    default: 'Scheduled'
  },
  confirmationId: {
    type: String,
    unique: true
  },
  assignedStaff: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  wasteAmount: { // Amount collected in kg (filled after completion)
    type: Number,
    default: null
  },
  containerFillLevel: { // Fill percentage reported by user
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  createdBy: {
    type: String, // Store username for quick reference
    required: true
  }
}, {
  timestamps: true
});

// Create confirmation ID before saving
wasteCollectionSchema.pre('save', function(next) {
  // Only generate confirmation ID if it doesn't exist
  if (!this.confirmationId) {
    const prefix = this.wasteType.slice(0, 2).toUpperCase();
    const random = Math.floor(Math.random() * 90000) + 10000; // 5-digit number
    this.confirmationId = `${prefix}-${random}`;
  }
  next();
});

// Add index for efficient querying
wasteCollectionSchema.index({ userId: 1, scheduledDate: 1 });
wasteCollectionSchema.index({ status: 1 });

const WasteCollection = mongoose.model('WasteCollection', wasteCollectionSchema);

export default WasteCollection;