export type BillStatus = "due" | "overdue" | "paid" | "partial";

export interface BillItem {
  id: string;
  title: string;              // "September Collection"
  dueDate: string;            // ISO
  tags?: string[];            // ["Regular", "Bulky Items"]
  amount: number;             // 28.50
  status: BillStatus;
}

export interface RewardCredit {
  id: string;
  label: string;              // "E-Waste (15kg)"
  date: string;               // ISO
  amount: number;             // +12.50
}

export interface Wallet {
  balance: number;            // 45.20
}

export interface Transaction {
  id: string;
  type: "payment" | "reward" | "refund" | "topup";
  label: string;              // "Payment - August Bill"
  date: string;               // ISO
  amount: number;             // negative for debits
}

export interface CheckoutRequest {
  billIds: string[];
  applyRewards: boolean;
  useWalletFirst: boolean;
  method: "wallet" | "card" | "upi" | "bank" | "cash";
  idempotencyKey: string;
}

export interface CheckoutQuote {
  subtotal: number;
  rewardsApplied: number;     // positive number to subtract
  previousDues: number;
  tax: number;
  netPayable: number;
  walletUse: number;          // how much will come from wallet
  externalPay: number;        // how much goes to gateway
  walletCreditOverflow?: number; // if rewards > bill (5b)
}

export type CheckoutStatus = "idle" | "quoting" | "readyToPay" | "processing" | "success" | "failure";

export interface Receipt {
  id: string;
  date: string;
  reference: string;
  idempotencyKey: string;
  payer: {
    name: string;
    id: string;
    address?: string;
  };
  items: {
    description: string;
    amount: number;
  }[];
  deductions: {
    description: string;
    amount: number;
  }[];
  taxes?: {
    description: string;
    amount: number;
  }[];
  total: number;
  paymentMethod: string;
}