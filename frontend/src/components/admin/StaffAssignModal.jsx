import React, { useState } from 'react';
import WasteCollectionService from '../../services/wasteCollectionService';

const StaffAssignModal = ({ isOpen, onClose, pickup, onSuccess }) => {
  const [staffName, setStaffName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens with new pickup
  React.useEffect(() => {
    if (isOpen && pickup) {
      setStaffName('');
      setError(null);
    }
  }, [isOpen, pickup]);

  if (!isOpen || !pickup) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!staffName.trim()) {
      setError('Staff name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await WasteCollectionService.assignStaff(pickup._id, staffName);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to assign staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Assign Staff to Pickup</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Pickup Confirmation: <span className="font-semibold">{pickup.confirmationId}</span></p>
          <p className="text-sm text-gray-600 mb-2">Waste Type: <span className="font-semibold">{pickup.wasteType}</span></p>
          <p className="text-sm text-gray-600">Address: <span className="font-semibold">{pickup.address}</span></p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Name
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter staff name"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Assigning...
                </>
              ) : (
                'Assign Staff'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffAssignModal;