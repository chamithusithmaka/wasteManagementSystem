import React from 'react';

const BillsCard = ({
  bills,
  selectedBillIds,
  onSelectBill,
  onSelectAll,
  onPayAll
}) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Calculate total of selected bills
  const selectedTotal = bills
    .filter(bill => selectedBillIds.includes(bill.id))
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  // Get counts
  const unpaidCount = bills.filter(bill => bill.status === 'due' || bill.status === 'overdue').length;
  
  // Sort bills: due/overdue first, then paid
  const sortedBills = [...bills].sort((a, b) => {
    const statusOrder = { 'overdue': 0, 'due': 1, 'paid': 2 };
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        {/* Changed from "Outstanding Bills" to "Bills" */}
        <h2 className="text-lg font-semibold text-gray-800">Bills</h2>
        <span className="text-sm text-gray-500">
          {unpaidCount > 0 ? `${unpaidCount} unpaid` : 'All paid'}
        </span>
      </div>

      {bills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No bills found</p>
          <p className="text-sm mt-2">Bills will appear here when services are completed</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center">
            <input
              type="checkbox"
              id="select-all"
              className="rounded text-green-500 focus:ring-green-400"
              checked={
                selectedBillIds.length > 0 &&
                selectedBillIds.length === bills.filter(bill => bill.status === 'due' || bill.status === 'overdue').length
              }
              onChange={onSelectAll}
            />
            <label htmlFor="select-all" className="ml-2 text-sm text-gray-600">
              Select all bills
            </label>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {sortedBills.map(bill => (
              <div 
                key={bill.id} 
                className={`flex items-center p-3 rounded-md border ${
                  selectedBillIds.includes(bill.id) ? 'border-green-400 bg-green-50' : 
                  bill.status === 'overdue' ? 'border-red-200 bg-red-50' :
                  bill.status === 'due' ? 'border-yellow-200 bg-yellow-50' :
                  'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  id={`bill-${bill.id}`}
                  className="rounded text-green-500 focus:ring-green-400"
                  checked={selectedBillIds.includes(bill.id)}
                  onChange={() => onSelectBill(bill.id)}
                  disabled={bill.status === 'paid'} // <-- Disable if paid
                />
                <div className="ml-3 flex-grow">
                  <div className="flex justify-between">
                    <label htmlFor={`bill-${bill.id}`} className="text-sm font-medium text-gray-800">
                      {bill.title}
                    </label>
                    <span className="text-sm font-semibold">
                      LKR {bill.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Due: {formatDate(bill.dueDate)}</span>
                      <div className="flex ml-2 space-x-1">
                        {bill.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      bill.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                      bill.status === 'due' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {bill.status === 'overdue' ? 'Overdue' : 
                       bill.status === 'due' ? 'Due' : 'Paid'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedBillIds.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Selected:</span>
                <span className="ml-1 text-lg font-bold">LKR {selectedTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={onPayAll}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium"
              >
                Pay {selectedBillIds.length > 1 ? 'All Selected' : 'Bill'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BillsCard;