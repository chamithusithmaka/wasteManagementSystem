import mongoose from "mongoose";

const WALLET_CURRENCIES = Object.freeze(["LKR", "USD"]);
const WALLET_TRANSACTION_TYPES = Object.freeze(["CREDIT", "DEBIT"]);

const transactionSubSchema = new mongoose.Schema(
  {
    txnId: { type: String, required: true },
    type: { type: String, enum: WALLET_TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: "" },
    refType: { type: String, default: "" },
    refId: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    residentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "LKR", enum: WALLET_CURRENCIES },
    transactions: {
      type: [transactionSubSchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

// Instance method: add transaction
walletSchema.methods.addTransaction = function (txn) {
  this.transactions.unshift(txn);
  return this.save();
};

// Static helper: create wallet with initial balance
walletSchema.statics.createWithBalance = async function (residentId, balance = 0, currency = "LKR") {
  return this.create({ residentId, balance, currency });
};

// Clean JSON output
walletSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

walletSchema.index({ residentId: 1 });

export { WALLET_CURRENCIES, WALLET_TRANSACTION_TYPES };
export default mongoose.model("Wallet", walletSchema);
