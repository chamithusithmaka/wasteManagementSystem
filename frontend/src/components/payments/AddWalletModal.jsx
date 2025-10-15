import React, { useState } from 'react';

const AddWalletModal = ({ isOpen, onClose, onAddFunds }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onAddFunds(parsedAmount);
      setAmount('');
      setPaymentMethod('card');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Add Funds to Wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Amount Input */}
          <div className="mb-5">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (LKR)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">LKR</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          {/* Payment Method Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="card"
                  name="payment-method"
                  type="radio"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                  Credit/Debit Card
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="upi"
                  name="payment-method"
                  type="radio"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="upi" className="ml-3 block text-sm font-medium text-gray-700">
                  UPI
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="bank"
                  name="payment-method"
                  type="radio"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="bank" className="ml-3 block text-sm font-medium text-gray-700">
                  Bank Transfer
                </label>
              </div>
            </div>
          </div>
          {/* Mock Payment Details */}
          {paymentMethod === 'card' && (
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <div>
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card number</label>
                  <input
                    type="text"
                    id="card-number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="1234 1234 1234 1234"
                  />
                </div>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">Expiry</label>
                    <input
                      type="text"
                      id="expiry"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                    <input
                      type="text"
                      id="cvc"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {paymentMethod === 'upi' && (
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <label htmlFor="upi-id" className="block text-sm font-medium text-gray-700">UPI ID</label>
              <input
                type="text"
                id="upi-id"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="name@upi"
              />
            </div>
          )}
          {paymentMethod === 'bank' && (
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                After clicking "Top up now", you'll be redirected to your bank's secure payment page to complete the transaction.
              </p>
            </div>
          )}
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !amount}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Top up now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWalletModal;