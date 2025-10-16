import React from 'react';

const BillAlert = ({ unpaidBills, onViewBills }) => {
  if (!unpaidBills || unpaidBills.length === 0) {
    return null;
  }
  
  // Separate overdue bills and due bills
  const overdueBills = unpaidBills.filter(bill => bill.status === 'overdue');
  const dueBills = unpaidBills.filter(bill => bill.status === 'due');
  
  // If no bills of either type, don't show alert
  if (overdueBills.length === 0 && dueBills.length === 0) {
    return null;
  }
  
  // Calculate totals
  const overdueTotal = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);
  const dueTotal = dueBills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalUnpaid = overdueTotal + dueTotal;
  
  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center mb-2">
            <div className="flex-shrink-0 text-orange-400">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">
                You have {unpaidBills.length} unpaid {unpaidBills.length === 1 ? 'bill' : 'bills'} totaling LKR {totalUnpaid.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="pl-8 text-xs space-y-1">
            {overdueBills.length > 0 && (
              <p className="text-red-600">
                • {overdueBills.length} overdue {overdueBills.length === 1 ? 'bill' : 'bills'} (LKR {overdueTotal.toFixed(2)})
                <span className="font-semibold"> - Must be paid before scheduling pickups</span>
              </p>
            )}
            
            {dueBills.length > 0 && (
              <p className="text-yellow-700">
                • {dueBills.length} upcoming {dueBills.length === 1 ? 'payment' : 'payments'} (LKR {dueTotal.toFixed(2)})
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={onViewBills}
          className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold py-2 px-4 rounded-md text-sm whitespace-nowrap"
        >
          View & Pay Bills
        </button>
      </div>
    </div>
  );
};

export default BillAlert;