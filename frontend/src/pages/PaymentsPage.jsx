import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getWallet, addFunds, getRecentTransactions } from '../Services/paymentServices'; // <-- import your service
import { useUser } from '../context/UserContext';
import Layout from '../components/Layout'; // <-- Import Layout
import HeaderBar from '../components/payments/HeaderBar';
import BillsCard from '../components/payments/BillsCard';
import RewardsCard from '../components/payments/RewardsCard';
import TransactionsCard from '../components/payments/TransactionsCard';
import AddWalletModal from '../components/payments/AddWalletModal';
import CheckoutModal from '../components/payments/CheckoutModal';
import ReceiptDrawer from '../components/payments/ReceiptDrawer';
import Toast from '../components/payments/Toast';
import BillAlert from '../components/payments/BillAlert'; // Add this import

// Mock data
const initialBills = [
  { id: "b1", title: "September Collection", dueDate: "2024-09-30", tags: ["Regular", "Bulky Items"], amount: 28.50, status: "overdue" },
  { id: "b2", title: "Special Pickup", dueDate: "2024-10-05", tags: ["E-Waste Collection"], amount: 15.00, status: "due" },
];
const initialRewards = [
  { id: "r1", label: "E-Waste (15kg)", date: "2024-09-20", amount: 12.50 },
  { id: "r2", label: "Recyclables (8kg)", date: "2024-09-15", amount: 4.20 },
  { id: "r3", label: "Bottles (24 units)", date: "2024-09-10", amount: 2.40 },
];
const initialTransactions = [
  { id: "t1", type: "payment", label: "Payment - August Bill", date: "2024-08-28", amount: -32.10 },
  { id: "t2", type: "reward",  label: "Reward - Recycling",   date: "2024-08-25", amount: +8.50 },
];

const PaymentsPage = () => {
  const { user } = useUser();
  const [wallet, setWallet] = useState({ balance: 0 });
  const [bills, setBills] = useState(initialBills);
  const [rewards, setRewards] = useState(initialRewards);
  const [transactions, setTransactions] = useState([]);

  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Added states for checkout process
  const [applyRewards, setApplyRewards] = useState(true);
  const [useWalletFirst, setUseWalletFirst] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [checkoutStatus, setCheckoutStatus] = useState("idle");
  const [checkoutReceipt, setCheckoutReceipt] = useState(null);
  const [showBillsSection, setShowBillsSection] = useState(false); // Add this state

  // Fetch wallet and recent transactions on mount or when user changes
  useEffect(() => {
  if (user?.id) {
    getWallet(user.id).then(setWallet).catch(() => setWallet({ balance: 0 }));
    getRecentTransactions(user.id, 5)
      .then(data => {
        // Map backend fields to frontend expected fields
        const mapped = data.map(txn => ({
          id: txn.txnId || txn._id, // fallback to _id if txnId missing
          type: txn.type === "CREDIT" ? "topup" : "payment", // or use txn.type directly if you want
          label: txn.note || (txn.type === "CREDIT" ? "Wallet Top-up" : "Payment"),
          date: txn.createdAt,
          amount: txn.type === "DEBIT" ? -Math.abs(txn.amount) : Math.abs(txn.amount),
        }));
        setTransactions(mapped);
      })
      .catch(() => setTransactions([]));
  }
}, [user]);

  // Bill selection logic
  const handleSelectBill = (billId) => {
    setSelectedBillIds((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBillIds.length === bills.length) {
      setSelectedBillIds([]);
    } else {
      setSelectedBillIds(bills.map((b) => b.id));
    }
  };

  // Add funds to wallet
  const handleAddFunds = async (amount) => {
    if (!user?.id) return;
    await addFunds(user.id, amount, "manual", user.email);
    const updated = await getWallet(user.id);
    setWallet(updated);
    setShowAddWallet(false);
    setToast({ message: `Added LKR ${amount.toFixed(2)} to wallet`, type: 'success' });
  };

  // Pay All (open checkout)
  const handlePayAll = () => {
    if (selectedBillIds.length === 0) return;
    setCheckoutStatus("idle");
    setShowCheckout(true);
  };
  
  // Pay Now button in checkout modal
  const handlePayNow = () => {
    setCheckoutStatus("processing");
    
    // Simulate processing delay
    setTimeout(() => {
      // Generate a receipt
      const selectedBillsData = bills.filter(bill => selectedBillIds.includes(bill.id));
      const totalAmount = selectedBillsData.reduce((sum, bill) => sum + bill.amount, 0);
      
      const receipt = {
        id: uuidv4(),
        date: new Date().toISOString(),
        reference: 'RCPT-' + Date.now().toString().slice(-6),
        idempotencyKey: uuidv4(),
        payer: { name: 'John Doe', id: 'U123' },
        items: selectedBillsData.map(bill => ({ 
          description: bill.title, 
          amount: bill.amount 
        })),
        deductions: applyRewards ? [{ 
          description: 'Rewards Applied', 
          amount: Math.min(
            rewards.reduce((sum, reward) => sum + reward.amount, 0), 
            totalAmount
          ) 
        }] : [],
        taxes: [],
        total: totalAmount - (applyRewards ? Math.min(
          rewards.reduce((sum, reward) => sum + reward.amount, 0), 
          totalAmount
        ) : 0),
        paymentMethod: paymentMethod === 'wallet' ? 'Wallet' : 
                     paymentMethod === 'card' && useWalletFirst ? 'Wallet + Card' :
                     paymentMethod === 'card' ? 'Card' : 'Cash at Office'
      };
      
      setCheckoutReceipt(receipt);
      setCheckoutStatus("success");
      
      // If success, update wallet balance for wallet payments
      if (paymentMethod === 'wallet' || useWalletFirst) {
        const walletDeduction = Math.min(wallet.balance, receipt.total);
        setWallet(prev => ({
          ...prev,
          balance: prev.balance - walletDeduction
        }));
      }
      
    }, 2000); // 2 second delay for simulation
  };

  // Checkout complete (simulate)
  const handleCheckoutSuccess = () => {
    // Mark bills as paid
    setBills((prev) =>
      prev.map((bill) =>
        selectedBillIds.includes(bill.id)
          ? { ...bill, status: 'paid' }
          : bill
      )
    );
    
    if (checkoutReceipt) {
      setTransactions((prev) => [
        { id: `t${prev.length + 1}`, type: 'payment', label: 'Payment - Bills', date: new Date().toISOString().slice(0, 10), amount: -checkoutReceipt.total },
        ...prev,
      ]);
      
      setShowCheckout(false);
      setActiveReceipt(checkoutReceipt);
      setShowReceipt(true);
      setSelectedBillIds([]);
      setToast({ message: 'Payment successful!', type: 'success' });
    }
  };

  // View receipt from transaction
  const handleViewReceipt = (id) => {
    const txn = transactions.find(t => t.id === id);
    if (!txn) return;

    setActiveReceipt({
      id: txn.id,
      date: txn.date,
      reference: 'RCPT-' + txn.id,
      idempotencyKey: txn.id,
      payer: {
        name: user?.username || 'User',
        id: user?.id || '',
        email: user?.email || '',      // <-- Add this line
      },
      items: [{
        description: txn.label,
        amount: Math.abs(txn.amount)
      }],
      deductions: [],
      taxes: [],
      total: Math.abs(txn.amount),
      paymentMethod: txn.type === 'topup' ? 'Wallet Top-up' : 'Wallet/Payment',
    });
    setShowReceipt(true);
  };

  // New function to handle "View & Pay Bills" action
  const handleViewUnpaidBills = () => {
    // Scroll to bills section and highlight it briefly
    setShowBillsSection(true);
    
    // Select all unpaid bills
    const unpaidBillIds = bills
      .filter(bill => bill.status === "overdue" || bill.status === "due")
      .map(bill => bill.id);
    setSelectedBillIds(unpaidBillIds);
    
    // After a delay, remove the highlight
    setTimeout(() => {
      setShowBillsSection(false);
    }, 3000);
    
    // Scroll to bills section
    const billsSection = document.getElementById('bills-section');
    if (billsSection) {
      billsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get unpaid bills for the alert
  const unpaidBills = bills.filter(bill => bill.status === "overdue" || bill.status === "due");

  return (
    <Layout>
      <div className="min-h-screen">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <HeaderBar
          title="Payments & Rewards"
          wallet={wallet}
          onAddFunds={() => setShowAddWallet(true)}
        />
        
        {/* Add Bill Alert here, right after HeaderBar */}
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <BillAlert 
            unpaidBills={unpaidBills}
            onViewBills={handleViewUnpaidBills}
          />
        </div>
        
        <div 
          id="bills-section"
          className={`max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 px-4 ${
            showBillsSection ? 'highlight-section' : ''
          }`}
        >
          <BillsCard
            bills={bills}
            selectedBillIds={selectedBillIds}
            onSelectBill={handleSelectBill}
            onSelectAll={handleSelectAll}
            onPayAll={handlePayAll}
          />
          <RewardsCard rewards={rewards} />
        </div>
        
        <div className="max-w-6xl mx-auto mt-8 px-4">
          <TransactionsCard
            transactions={transactions}
            onViewReceipt={handleViewReceipt}
          />
        </div>
        <AddWalletModal
          isOpen={showAddWallet}
          onClose={() => setShowAddWallet(false)}
          onAddFunds={handleAddFunds}
        />
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          selectedBills={bills.filter((b) => selectedBillIds.includes(b.id))}
          wallet={wallet}
          rewards={rewards}
          applyRewards={applyRewards}
          setApplyRewards={setApplyRewards}
          useWalletFirst={useWalletFirst}
          setUseWalletFirst={setUseWalletFirst}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          checkoutStatus={checkoutStatus}
          onPayNow={handlePayNow}
          receipt={checkoutReceipt}
          onViewReceipt={handleCheckoutSuccess}
        />
        <ReceiptDrawer
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          receipt={activeReceipt}
        />
      </div>
    </Layout>
  );
};

export default PaymentsPage;