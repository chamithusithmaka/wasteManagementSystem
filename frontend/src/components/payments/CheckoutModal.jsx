import React from 'react';
import { calculateCheckout } from '../../utils/paymentCalculator';

const CheckoutModal = ({
  isOpen,
  onClose,
  selectedBills,
  rewards,
  wallet,
  applyRewards,
  setApplyRewards,
  useWalletFirst,
  setUseWalletFirst,
  paymentMethod,
  setPaymentMethod,
  checkoutStatus,
  onPayNow,
  receipt,
  onViewReceipt
}) => {
  if (!isOpen) return null;

  // Calculate checkout details
  const quote = calculateCheckout(selectedBills, rewards, wallet, applyRewards, useWalletFirst);

  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  // Calculate if wallet only payment is possible
  const canPayWithWalletOnly = wallet.balance >= quote.netPayable;

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    if (method === "wallet" && !canPayWithWalletOnly) {
      // Can't use wallet only if insufficient funds
      return;
    }
    setPaymentMethod(method);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {checkoutStatus === "success" ? "Payment Successful" : "Checkout"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Success State */}
        {checkoutStatus === "success" && receipt && (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful</h3>
              <p className="text-gray-600 mb-4">Your payment of {formatCurrency(receipt.total)} was successful.</p>
              <div className="text-sm text-gray-500 mb-6">
                Payment method: <span className="font-medium">{receipt.paymentMethod}</span>
              </div>
              <div className="space-x-4">
                <button 
                  onClick={onViewReceipt}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  View Receipt
                </button>
                <button 
                  onClick={onClose}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Checkout Content */}
        {checkoutStatus !== "success" && (
          <div className="p-6">
            {/* Selected Bills Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Selected Bills</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                {selectedBills.map(bill => (
                  <div key={bill.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{bill.title}</p>
                      {bill.tags && bill.tags.length > 0 && (
                        <div className="flex mt-1 space-x-1">
                          {bill.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Quote Box */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Subtotal</span>
                    <span className="text-sm font-medium">{formatCurrency(quote.subtotal)}</span>
                  </div>
                  
                  {applyRewards && quote.rewardsApplied > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Rewards Applied</span>
                      <span className="text-sm font-medium text-green-700">
                        -{formatCurrency(quote.rewardsApplied)}
                      </span>
                    </div>
                  )}
                  
                  {quote.previousDues > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Previous Dues</span>
                      <span className="text-sm font-medium">{formatCurrency(quote.previousDues)}</span>
                    </div>
                  )}
                  
                  {quote.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Tax</span>
                      <span className="text-sm font-medium">{formatCurrency(quote.tax)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-800">Net Payable</span>
                      <span className="text-base font-semibold text-blue-700">
                        {formatCurrency(quote.netPayable)}
                      </span>
                    </div>
                  </div>
                  
                  {quote.walletCreditOverflow && (
                    <div className="mt-2 bg-green-100 p-2 rounded-md">
                      <p className="text-xs text-green-800">
                        Extra {formatCurrency(quote.walletCreditOverflow)} will be credited to your wallet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Payment Options */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Method</h3>
              
              <div className="space-y-3">
                {/* Wallet Only */}
                <div 
                  className={`border rounded-lg p-3 flex items-center cursor-pointer ${
                    paymentMethod === "wallet" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  } ${!canPayWithWalletOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => canPayWithWalletOnly && handlePaymentMethodChange("wallet")}
                >
                  <input
                    type="radio"
                    id="wallet"
                    name="payment-method"
                    checked={paymentMethod === "wallet"}
                    onChange={() => canPayWithWalletOnly && handlePaymentMethodChange("wallet")}
                    disabled={!canPayWithWalletOnly}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="wallet" className="ml-3 flex flex-1 justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Wallet Only</p>
                      <p className="text-xs text-gray-500">Current balance: {formatCurrency(wallet.balance)}</p>
                    </div>
                    {paymentMethod === "wallet" && canPayWithWalletOnly && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        External gateway will be skipped
                      </span>
                    )}
                  </label>
                </div>
                
                {/* Wallet + Card */}
                <div 
                  className={`border rounded-lg p-3 flex items-center cursor-pointer ${
                    paymentMethod === "card" && useWalletFirst ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => { handlePaymentMethodChange("card"); setUseWalletFirst(true); }}
                >
                  <input
                    type="radio"
                    id="wallet-card"
                    name="payment-method"
                    checked={paymentMethod === "card" && useWalletFirst}
                    onChange={() => { handlePaymentMethodChange("card"); setUseWalletFirst(true); }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="wallet-card" className="ml-3 flex flex-1 justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Wallet + Card</p>
                      <p className="text-xs text-gray-500">
                        Uses {formatCurrency(quote.walletUse)} from wallet, {formatCurrency(quote.externalPay)} from card
                      </p>
                    </div>
                  </label>
                </div>
                
                {/* Card Only */}
                <div 
                  className={`border rounded-lg p-3 flex items-center cursor-pointer ${
                    paymentMethod === "card" && !useWalletFirst ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => { handlePaymentMethodChange("card"); setUseWalletFirst(false); }}
                >
                  <input
                    type="radio"
                    id="card"
                    name="payment-method"
                    checked={paymentMethod === "card" && !useWalletFirst}
                    onChange={() => { handlePaymentMethodChange("card"); setUseWalletFirst(false); }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="card" className="ml-3">
                    <p className="text-sm font-medium text-gray-800">Card / UPI / Bank</p>
                    <p className="text-xs text-gray-500">Pay full amount with external payment</p>
                  </label>
                </div>
                
                {/* Cash at Office */}
                <div 
                  className={`border rounded-lg p-3 flex items-center cursor-pointer ${
                    paymentMethod === "cash" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => handlePaymentMethodChange("cash")}
                >
                  <input
                    type="radio"
                    id="cash"
                    name="payment-method"
                    checked={paymentMethod === "cash"}
                    onChange={() => handlePaymentMethodChange("cash")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="cash" className="ml-3">
                    <p className="text-sm font-medium text-gray-800">Cash at Office</p>
                    <p className="text-xs text-gray-500">Pay at our office (creates pending receipt)</p>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Options */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="apply-rewards"
                  checked={applyRewards}
                  onChange={(e) => setApplyRewards(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="apply-rewards" className="ml-2 text-sm font-medium text-gray-700">
                  Apply rewards/payback
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="use-wallet-first"
                  checked={useWalletFirst}
                  onChange={(e) => setUseWalletFirst(e.target.checked)}
                  disabled={paymentMethod === "wallet" || paymentMethod === "cash"}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="use-wallet-first" className={`ml-2 text-sm font-medium ${
                  paymentMethod === "wallet" || paymentMethod === "cash" ? "text-gray-400" : "text-gray-700"
                }`}>
                  Use wallet first
                </label>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 mr-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                disabled={checkoutStatus === "processing"}
              >
                Cancel
              </button>
              <button
                onClick={onPayNow}
                disabled={checkoutStatus === "processing"}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center"
              >
                {checkoutStatus === "processing" ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Pay Now'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;