import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getWallet, addFunds, getCurrentMonthBills } from '../Services/paymentServices';
import { getResidentRewards } from '../Services/rewardServices';
import { getUserBills, payMultipleBills } from '../Services/billServices'; // Add this import
import { getRecentTransactions } from '../Services/transactionServices.js';
import { useUser } from '../context/UserContext';
import Layout from '../components/Layout';
import HeaderBar from '../components/payments/HeaderBar';
import BillsCard from '../components/payments/BillsCard';
import RewardsCard from '../components/payments/RewardsCard';
import TransactionsCard from '../components/payments/TransactionsCard';
import AddWalletModal from '../components/payments/AddWalletModal';
import CheckoutModal from '../components/payments/CheckoutModal';
import ReceiptDrawer from '../components/payments/ReceiptDrawer';
import Toast from '../components/payments/Toast';
import BillAlert from '../components/payments/BillAlert';

const PaymentsPage = () => {
  const { user } = useUser();
  const [wallet, setWallet] = useState({ balance: 0 });
  const [bills, setBills] = useState([]); // Start with empty array
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentMonthBills, setCurrentMonthBills] = useState([]);

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
  const [txnLimit, setTxnLimit] = useState(5);
  const [showAllTxns, setShowAllTxns] = useState(false);

  // Fetch wallet, transactions, rewards, and bills on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      // Fetch wallet data
      getWallet()  // No need to pass residentId anymore
        .then(setWallet)
        .catch((error) => {
          console.error("Wallet fetch error:", error);
          setWallet({ balance: 0 });
        });
      
      // Fetch transactions using new service
      getRecentTransactions(txnLimit)
        .then(transactions => {
          const mapped = transactions.map(txn => ({
            id: txn._id,
            type: txn.type === "CREDIT" ? "topup" : "payment",
            label: txn.note,
            date: txn.createdAt,
            amount: txn.type === "DEBIT" ? -Math.abs(txn.amount) : Math.abs(txn.amount),
            paymentMethod: txn.paymentMethod,
            status: txn.status
          }));
          setTransactions(mapped);
        })
        .catch(() => setTransactions([]));
      
      // Fetch rewards
      getResidentRewards()
        .then(data => {
          const mappedRewards = data.map(reward => ({
            id: reward._id,
            label: reward.label,
            date: reward.date,
            amount: reward.amount,
            description: reward.description,
            type: reward.type
          }));
          setRewards(mappedRewards);
        })
        .catch(err => {
          console.error('Failed to fetch rewards:', err);
          setRewards([]);
        });
      
      // Fetch bills (new)
      getUserBills()
        .then(data => {
          // Map to match our expected format in the UI
          const mappedBills = data.map(bill => ({
            id: bill._id,
            title: bill.title,
            dueDate: bill.dueDate,
            tags: bill.tags || [],
            amount: bill.amount,
            status: bill.status,
            invoiceNumber: bill.invoiceNumber,
            collectionId: bill.collectionId
          }));
          setBills(mappedBills);
        })
        .catch(err => {
          console.error('Failed to fetch bills:', err);
          setBills([]);
        });
    
      // Fetch current month bills from backend
      getCurrentMonthBills()
        .then(bills => {
          // Map to match UI format if needed
          const mapped = bills.map(bill => ({
            id: bill._id,
            title: bill.title,
            dueDate: bill.dueDate,
            tags: bill.tags || [],
            amount: bill.amount,
            status: bill.status,
            invoiceNumber: bill.invoiceNumber,
            collectionId: bill.collectionId
          }));
          setCurrentMonthBills(mapped);
        })
        .catch(err => {
          console.error('Failed to fetch current month bills:', err);
          setCurrentMonthBills([]);
        });
    }
  }, [user, txnLimit]);

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
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const result = await addFunds(user.id, amount);
      console.log('Add funds result:', result);
      
      // Update wallet balance
      setWallet(prev => ({
        ...prev,
        balance: result.newBalance
      }));
      
      // Refresh transactions
      const updatedTransactions = await getRecentTransactions(5);
      const mappedTransactions = updatedTransactions.map(txn => ({
        id: txn._id,
        type: txn.type === "CREDIT" ? "topup" : "payment",
        label: txn.note || (txn.type === "CREDIT" ? "Wallet Top-up" : "Payment"),
        date: txn.createdAt,
        amount: txn.type === "DEBIT" ? -Math.abs(txn.amount) : Math.abs(txn.amount),
        paymentMethod: txn.paymentMethod,
        status: txn.status
      }));
      
      setTransactions(mappedTransactions);
      setShowAddWallet(false);
      setToast({ 
        message: `Added LKR ${amount.toFixed(2)} to wallet`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Add funds error:', error);
      setToast({ 
        message: error.message || 'Failed to add funds to wallet', 
        type: 'error' 
      });
    }
  };

  // Pay All (open checkout)
  const handlePayAll = () => {
    if (selectedBillIds.length === 0) return;
    setCheckoutStatus("idle");
    setShowCheckout(true);
  };
  
  // Pay Now button in checkout modal
  const handlePayNow = async () => {
    setCheckoutStatus("processing");
    
    try {
      // Get data about selected bills
      const selectedBillsData = bills.filter(bill => selectedBillIds.includes(bill.id));
      
      // Call API to pay bills
      const response = await payMultipleBills(
        selectedBillIds, 
        paymentMethod,
        useWalletFirst,
        applyRewards
      );
      
      // Create receipt from response
      const receipt = {
        id: response.paymentId || uuidv4(),
        date: new Date().toISOString(),
        reference: response.reference || ('RCPT-' + Date.now().toString().slice(-6)),
        idempotencyKey: uuidv4(),
        payer: { 
          name: user?.username || 'User', 
          id: user?.id || 'U123',
          email: user?.email || ''
        },
        items: selectedBillsData.map(bill => ({ 
          description: bill.title, 
          amount: bill.amount 
        })),
        deductions: response.deductions || [],
        taxes: response.taxes || [],
        total: response.totalPaid,
        paymentMethod: response.paymentMethod || (
          paymentMethod === 'wallet' ? 'Wallet' : 
          paymentMethod === 'card' && useWalletFirst ? 'Wallet + Card' :
          paymentMethod === 'card' ? 'Card' : 'Cash at Office'
        )
      };
      
      setCheckoutReceipt(receipt);
      setCheckoutStatus("success");
      
      // Refresh wallet balance
      if (user?.id) {
        const updated = await getWallet(user.id);
        setWallet(updated);
      }
      
    } catch (error) {
      console.error("Payment failed:", error);
      setCheckoutStatus("error");
      setToast({ message: error.message || 'Payment failed. Please try again.', type: 'error' });
    }
  };

  // Checkout complete (simulate)
  const handleCheckoutSuccess = async () => {
    // Refresh bills list instead of manually updating
    try {
      const updatedBills = await getUserBills();
      const mappedBills = updatedBills.map(bill => ({
        id: bill._id,
        title: bill.title,
        dueDate: bill.dueDate,
        tags: bill.tags || [],
        amount: bill.amount,
        status: bill.status,
        invoiceNumber: bill.invoiceNumber,
        collectionId: bill.collectionId
      }));
      setBills(mappedBills);
      
      // Refresh wallet
      const updatedWallet = await getWallet();
      setWallet(updatedWallet);
      
      // Refresh transactions - FIX THIS PART
      const updatedTransactions = await getRecentTransactions(5); // Don't pass user.id
      const mappedTxns = updatedTransactions.map(txn => ({
        id: txn._id || txn.txnId,
        type: txn.type === "CREDIT" ? "topup" : "payment",
        label: txn.note || (txn.type === "CREDIT" ? "Wallet Top-up" : "Payment"),
        date: txn.createdAt,
        amount: txn.type === "DEBIT" ? -Math.abs(txn.amount) : Math.abs(txn.amount),
        paymentMethod: txn.paymentMethod,
        status: txn.status
      }));
      setTransactions(mappedTxns);
      
      setShowCheckout(false);
      setActiveReceipt(checkoutReceipt);
      setShowReceipt(true);
      setSelectedBillIds([]);
      setToast({ message: 'Payment successful!', type: 'success' });
    } catch (error) {
      console.error("Error refreshing data:", error);
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
  const overdueBills = bills.filter(bill => bill.status === 'overdue'); // <-- Added this line

  // New function to refresh all payment data
  const refreshAllPaymentData = async () => {
    if (user?.id) {
      // Refresh wallet
      getWallet().then(setWallet).catch(() => setWallet({ balance: 0 }));

      // Refresh transactions
      getRecentTransactions(txnLimit)
        .then(transactions => {
          const mapped = transactions.map(txn => ({
            id: txn._id,
            type: txn.type === "CREDIT" ? "topup" : "payment",
            label: txn.note,
            date: txn.createdAt,
            amount: txn.type === "DEBIT" ? -Math.abs(txn.amount) : Math.abs(txn.amount),
            paymentMethod: txn.paymentMethod,
            status: txn.status
          }));
          setTransactions(mapped);
        })
        .catch(() => setTransactions([]));

      // Refresh rewards
      getResidentRewards()
        .then(data => {
          const mappedRewards = data.map(reward => ({
            id: reward._id,
            label: reward.label,
            date: reward.date,
            amount: reward.amount,
            description: reward.description,
            type: reward.type
          }));
          setRewards(mappedRewards);
        })
        .catch(() => setRewards([]));

      // Refresh bills
      getUserBills()
        .then(data => {
          const mappedBills = data.map(bill => ({
            id: bill._id,
            title: bill.title,
            dueDate: bill.dueDate,
            tags: bill.tags || [],
            amount: bill.amount,
            status: bill.status,
            invoiceNumber: bill.invoiceNumber,
            collectionId: bill.collectionId
          }));
          setBills(mappedBills);
        })
        .catch(() => setBills([]));
    }
  };

  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter bills for current month AND status "due"
  const currentMonthBillsFiltered = bills.filter(bill => {
    if (!bill.dueDate || bill.status !== "due") return false;
    
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    
    // Check if the bill is due in the current month and year
    return (
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  });

  // Also add logging to debug date issues
  console.log('Current month/year:', currentMonth, currentYear);
  console.log('Bills with due dates:', bills.map(b => ({
    title: b.title, 
    dueDate: b.dueDate, 
    status: b.status,
    month: b.dueDate ? new Date(b.dueDate).getMonth() : 'invalid'
  })));
  console.log('Current month bills found:', currentMonthBillsFiltered);
const currentMonthTotal = currentMonthBills.reduce((sum, bill) => sum + bill.amount, 0);
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
            unpaidBills={unpaidBills} // Pass all unpaid bills (both due and overdue)
            onViewBills={handleViewUnpaidBills}
          />
        </div>
        
        {/* Current Month Bills Section */}
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Current Month Bills
            </h3>
            {currentMonthBills.length === 0 ? (
              <p className="text-gray-500 text-sm">No bills for this month.</p>
            ) : (
              <>
                <ul>
                  {currentMonthBills.map(bill => (
                    <li key={bill.id} className="flex justify-between py-1 text-sm">
                      <span>{bill.title}</span>
                      <span className="font-medium">
                        LKR {bill.amount.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between mt-2 pt-2 border-t text-base font-semibold text-blue-900">
                  <span>Total</span>
                  <span>LKR {currentMonthTotal.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
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
            onExpand={() => {
              if (showAllTxns) {
                setTxnLimit(5);
                setShowAllTxns(false);
              } else {
                setTxnLimit(50);
                setShowAllTxns(true);
              }
            }}
            showAll={showAllTxns}
            canExpand={transactions.length > 0}
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
          onClose={() => {
            setShowReceipt(false);
            setActiveReceipt(null);
            refreshAllPaymentData(); // <-- Refresh data after closing receipt
          }}
          receipt={activeReceipt}
        />
        
        {/* Show/Hide All Transactions button */}
        <div className="flex justify-center mt-2">
          
        </div>
      </div>
    </Layout>
  );
};

export default PaymentsPage;