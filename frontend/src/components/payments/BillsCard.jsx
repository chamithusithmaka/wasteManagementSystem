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
  const totalSelected = bills
    .filter(bill => selectedBillIds.includes(bill.id))
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Outstanding Bills</h2>
        <span className="text-sm text-gray-500">{bills.length} bills</span>
      </div>
      
      {/* Select All Row */}
      <div className="flex items-center justify-between py-3 border-b">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedBillIds.length === bills.length && bills.length > 0}
            onChange={onSelectAll}
            className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
          />
          <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-700">
            Select All
          </label>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {selectedBillIds.length} of {bills.length} selected
        </span>
      </div>
      
      {/* Bill Rows */}
      <div className="divide-y">
        {bills.map(bill => (
          <div 
            key={bill.id}
            className={`py-4 flex items-center justify-between ${
              bill.status === "overdue" ? "bg-red-50" : ""
            }`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                id={`bill-${bill.id}`}
                checked={selectedBillIds.includes(bill.id)}
                onChange={() => onSelectBill(bill.id)}
                className="h-4 w-4 text-green-600 rounded focus:ring-green-500 mt-1"
              />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">{bill.title}</h3>
                <p className={`text-xs ${
                  bill.status === "overdue" ? "text-red-600 font-semibold" : "text-gray-500"
                }`}>
                  Due {formatDate(bill.dueDate)}
                  {bill.status === "overdue" && " (Overdue)"}
                </p>
                {bill.tags && bill.tags.length > 0 && (
                  <div className="flex mt-1 space-x-1">
                    {bill.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={`text-sm font-medium ${
              bill.status === "overdue" ? "text-red-600" : "text-gray-700"
            }`}>
              LKR {bill.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pay All Button */}
      <div className="mt-5 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-800">
          Total Selected: <span className="text-green-700">LKR {totalSelected.toFixed(2)}</span>
        </div>
        <button
          onClick={onPayAll}
          disabled={selectedBillIds.length === 0}
          className={`px-5 py-2 rounded-lg font-medium text-white shadow-sm
            ${selectedBillIds.length === 0 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          Pay {selectedBillIds.length > 0 ? `(${selectedBillIds.length})` : "All"}
        </button>
      </div>
    </div>
  );
};

export default BillsCard;