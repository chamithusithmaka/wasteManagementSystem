import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WasteCollectionService from '../../services/wasteCollectionService';

const WasteCollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPickupDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real data from API
        const pickupData = await WasteCollectionService.getPickup(id);
        
        // Process the data, extracting user details from populated userId field
        const userData = pickupData.userId || {};
        
        setPickup({
          ...pickupData,
          // Use the populated user data
          userName: userData.name || pickupData.userName || 'Not available',
          userPhone: userData.phone || pickupData.userPhone || 'Not available',
          userEmail: userData.email || 'Not available',
          userId: userData._id || pickupData.userId || 'Not available',
          wasteDescription: pickupData.notes || 'No description provided',
          specialInstructions: pickupData.specialInstructions || pickupData.notes || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pickup details:', err);
        setError('Failed to load pickup details. Please try again.');
        setLoading(false);
      }
    };

    fetchPickupDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      // Update status in the UI immediately (optimistic update)
      setPickup(prev => ({
        ...prev,
        status: newStatus
      }));
      
      // Call the API to update the status
      await WasteCollectionService.updatePickup(id, { status: newStatus });
      
      // Show success message
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert UI changes if update failed
      setPickup(prev => ({ ...prev }));
      alert('Failed to update status. Please try again.');
    }
  };

  const handleAssignStaff = async () => {
    const staffName = prompt('Enter staff name:');
    if (staffName) {
      try {
        // Optimistic update
        setPickup(prev => ({
          ...prev,
          assignedStaff: staffName,
          status: 'In Progress'
        }));
        
        // Call API to update
        await WasteCollectionService.assignStaff(id, staffName);
      } catch (error) {
        console.error('Error assigning staff:', error);
        // Revert UI changes if update failed
        setPickup(prev => ({ ...prev }));
        alert('Failed to assign staff. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/admin/waste-collection')}
          className="mt-2 text-red-700 underline"
        >
          Go back to waste collection
        </button>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
        <p>Pickup not found.</p>
        <button 
          onClick={() => navigate('/admin/waste-collection')}
          className="mt-2 text-yellow-700 underline"
        >
          Go back to waste collection
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Pickup Details</h1>
        <button
          onClick={() => navigate('/admin/waste-collection')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Waste Collection
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-green-700">
              Confirmation #{pickup.confirmationId || 'Not assigned'}
            </h2>
            <p className="text-sm text-gray-500">
              Created on {formatDate(pickup.createdAt)}
            </p>
          </div>
          <StatusBadge status={pickup.status} />
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium text-gray-700">Name:</span> {pickup.userName}</p>
              <p><span className="font-medium text-gray-700">User ID:</span> {pickup.userId}</p>
              <p><span className="font-medium text-gray-700">Phone:</span> {pickup.userPhone}</p>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Pickup Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium text-gray-700">Scheduled Date:</span> {formatDate(pickup.scheduledDate)}</p>
              <p><span className="font-medium text-gray-700">Time Window:</span> {pickup.scheduledTime}</p>
              <p><span className="font-medium text-gray-700">Waste Type:</span> {pickup.wasteType}</p>
              <p><span className="font-medium text-gray-700">Description:</span> {pickup.wasteDescription}</p>
              <p><span className="font-medium text-gray-700">Container Fill Level:</span> {pickup.containerFillLevel || 0}%</p>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full ${(pickup.containerFillLevel || 0) > 90 ? 'bg-red-500' : (pickup.containerFillLevel || 0) > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${pickup.containerFillLevel || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Location Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium text-gray-700">Address:</span> {pickup.address}</p>
              <p><span className="font-medium text-gray-700">Province:</span> {pickup.province}</p>
              <p><span className="font-medium text-gray-700">Special Instructions:</span> {pickup.specialInstructions || 'None'}</p>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Staff Assignment</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium text-gray-700">Assigned Staff:</span> 
                {pickup.assignedStaff ? pickup.assignedStaff : (
                  <span className="text-gray-400 italic"> Not assigned</span>
                )}
              </p>
              {pickup.completedAt && (
                <p>
                  <span className="font-medium text-gray-700">Completed On:</span> 
                  {formatDate(pickup.completedAt)}
                </p>
              )}
              {pickup.wasteAmount && (
                <p>
                  <span className="font-medium text-gray-700">Waste Amount:</span> 
                  {pickup.wasteAmount} kg
                </p>
              )}
            </div>
            
            {/* Location map placeholder */}
            <div className="mt-3 bg-gray-100 rounded-lg h-40 flex items-center justify-center">
              <p className="text-gray-500">Map placeholder</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {pickup.status === 'Scheduled' && (
              <>
                <button
                  onClick={() => handleAssignStaff()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Staff
                </button>
                <button
                  onClick={() => handleStatusUpdate('Cancelled')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Pickup
                </button>
              </>
            )}
            {pickup.status === 'In Progress' && (
              <button
                onClick={() => navigate(`/admin/waste-collection/${id}/complete`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Pickup
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  // Define styles for different statuses
  const statusStyles = {
    Scheduled: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Pending: 'bg-purple-100 text-purple-800'
  };
  
  // Use default style if status doesn't match
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-medium ${style}`}>
      {status}
    </span>
  );
};

export default WasteCollectionDetails;