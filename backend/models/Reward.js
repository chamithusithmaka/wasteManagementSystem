import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  residentId: {
    type: String, // or mongoose.Schema.Types.ObjectId if you use ObjectId for users
    required: true,
    index: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WasteCollection',
    required: true,
  },
  type: {
    type: String,
    enum: ['Recyclables', 'Compost', 'E-Waste', 'Bottles', 'General', 'Other'],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  amount: { // Reward amount in LKR or points
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    default: 'LKR', // or 'points'
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: String, // Optional: e.g. "Reward for 15kg E-Waste"
  createdBy: {
    type: String, // username or admin who approved
    required: true,
  },
  // New fields to track reward usage
  used: {
    type: Boolean,
    default: false
  },
  usedAmount: {
    type: Number,
    default: 0
  },
  usedDate: Date,
  usedFor: String
}, {
  timestamps: true,
});

export default mongoose.model('Reward', rewardSchema);