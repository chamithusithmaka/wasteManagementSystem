import React from 'react';
import { sendReceiptEmail } from '../../Services/paymentServices';
import generatePDF from '../common/PDFGenerator';

const ReceiptDrawer = ({ isOpen, onClose, receipt }) => {
  if (!isOpen || !receipt) return null;
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${amount.toFixed(2)}`;
  };
  
  // Handle download as PDF
  const handleDownload = () => {
    // Format date for display
    const formattedDate = formatDate(receipt.date);
    
    // Format receipt data for PDF
    generatePDF({
      title: 'Payment Receipt',
      filename: `receipt-${receipt.reference}`,
      document: {
        'Receipt #': receipt.reference,
        'Date': formattedDate,
        'Payment Method': receipt.paymentMethod,
        'Customer': receipt.payer.name,
        'Email': receipt.payer.email || 'N/A'
      },
      tableColumns: ['Description', 'Amount (LKR)'],
      tableData: [
        // Items rows
        ...receipt.items.map(item => [
          item.description, 
          item.amount.toFixed(2)
        ]),
        // Deductions rows (if any)
        ...(receipt.deductions || []).map(ded => [
          `${ded.description} (Discount)`, 
          `-${ded.amount.toFixed(2)}`
        ]),
        // Taxes rows (if any)
        ...(receipt.taxes || []).map(tax => [
          tax.description, 
          tax.amount.toFixed(2)
        ])
      ],
      summary: {
        'Subtotal': receipt.items.reduce((sum, item) => sum + item.amount, 0),
        'Discounts': (receipt.deductions || []).reduce((sum, d) => sum + d.amount, 0),
        'Tax': (receipt.taxes || []).reduce((sum, t) => sum + t.amount, 0),
        'Total Amount': receipt.total
      },
      footer: 'Thank you for choosing UrbanWasteX for your waste management needs.'
    });
  };
  
  // Handle send to email
  const handleEmailReceipt = async () => {
    try {
      await sendReceiptEmail(receipt.payer.email, receipt);
      alert('Receipt sent to your email!');
    } catch (err) {
      alert('Failed to send receipt: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto animate-slide-in-right">
        {/* Drawer Header */}
        <div className="bg-gray-100 p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">Receipt</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Receipt Content */}
        <div className="p-6">
          {/* Receipt Status */}
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-700">Paid</h3>
              <p className="text-sm text-gray-600">{formatDate(receipt.date)}</p>
            </div>
          </div>
          
          {/* Receipt Details */}
          <div className="bg-gray-50 p-5 rounded-lg mb-6">
            <div className="mb-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Receipt #:</span>
                <span className="font-medium text-gray-800">{receipt.reference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-800">{receipt.idempotencyKey.substring(0, 8)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Payer Details</h4>
              <p className="text-sm">{receipt.payer.name}</p>
              <p className="text-sm text-gray-600">ID: {receipt.payer.id}</p>
              {receipt.payer.email && (
                <p className="text-sm text-gray-600">Email: {receipt.payer.email}</p>
              )}
              {receipt.payer.address && <p className="text-sm text-gray-600">{receipt.payer.address}</p>}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm mb-1">
                  <span>{item.description}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
            
            {receipt.deductions.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Deductions</h4>
                {receipt.deductions.map((deduction, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>{deduction.description}</span>
                    <span className="text-green-600">-{formatCurrency(deduction.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {receipt.taxes && receipt.taxes.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Taxes</h4>
                {receipt.taxes.map((tax, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>{tax.description}</span>
                    <span>{formatCurrency(tax.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(receipt.total)}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Method</h4>
            <p className="text-sm">{receipt.paymentMethod}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md mb-6">
            <p className="text-xs text-gray-600 text-center">
              This receipt has been logged to your transaction history & will appear in your monthly report.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={handleDownload}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download PDF
            </button>
            <button 
              onClick={handleEmailReceipt}
              className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Send to Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDrawer;
