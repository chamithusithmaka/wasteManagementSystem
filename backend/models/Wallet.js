import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    residentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "LKR", enum: ["LKR", "USD"] },
    transactions: [
      {
        txnId: { type: String, required: true },
        type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
        amount: { type: Number, required: true },
        note: String,
        refType: String,
        refId: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Wallet", walletSchema);
