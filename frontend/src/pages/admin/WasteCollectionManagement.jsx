import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WasteCollectionService from '../../services/wasteCollectionService';
import ContainerService from '../../services/containerService';
import { StatusBadge, StaffAssignModal, CompletePickupModal, AlertBanner } from '../../components/admin';
import { formatDate, formatTime } from '../../utils/formatters';

const WasteCollectionManagement = () => {
  // State variables
  const [pickups, setPickups] = useState([]);
  const [fullContainers, setFullContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  
  const navigate = useNavigate();
  
  // Fetch all data on component mount and when dependencies change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch waste collection pickups
        const result = await WasteCollectionService.getAllPickups(statusFilter, currentPage);
        setPickups(result.pickups || []);
        setTotalPages(result.totalPages || 1);
        
        // Fetch full containers
        const containers = await ContainerService.getContainersByStatus('Full');
        setFullContainers(containers || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, statusFilter, refreshTrigger]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter
  };
  
  // Open assign staff modal
  const handleAssignStaff = (pickup) => {
    setSelectedPickup(pickup);
    setAssignModalOpen(true);
  };
  
  // Open complete pickup modal
  const handleCompletePickup = (pickup) => {
    setSelectedPickup(pickup);
    setCompleteModalOpen(true);
  };
  
  // Handle successful action and refresh data
  const handleActionSuccess = () => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    setAssignModalOpen(false);
    setCompleteModalOpen(false);
    setSelectedPickup(null);
  };

  // Handle container collection
  const handleCollectContainer = async (containerId) => {
    try {
      await ContainerService.scheduleCollection(containerId);
      // Refresh data after scheduling
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error scheduling container collection:', error);
      setError('Failed to schedule container collection');
    }
  };
  
  // View pickup details
  const viewPickupDetails = (id) => {
    navigate(`/admin/waste-collection/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Waste Collection Management</h1>
      
      {/* Alert for full containers */}
      {fullContainers.length > 0 && (
        <AlertBanner 
          title={`${fullContainers.length} Container${fullContainers.length > 1 ? 's' : ''} Require Collection`} 
          type="warning"
          className="mb-6"
        >
          <div className="mt-3">
            <button 
              onClick={() => navigate('/admin/containers/full')}
              className="mr-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              View All
            </button>
            <button 
              onClick={() => setFullContainers([])} 
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </AlertBanner>
      )}
      
      {/* Error message */}
      {error && (
        <AlertBanner title="Error" type="error" className="mb-6">
          {error}
        </AlertBanner>
      )}
      
      {/* Filter and control bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full md:w-auto px-4 py-2 border rounded-lg bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={() => navigate('/admin/containers')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>Manage Containers</span>
          </button>
          <button 
            onClick={() => navigate('/admin/reports')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>View Reports</span>
          </button>
        </div>
      </div>
      
      {/* Full Containers Preview */}
      {fullContainers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            Full Containers Requiring Attention
          </h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fullContainers.slice(0, 3).map((container) => (
                    <tr key={container._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{container.containerId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{container.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{ width: `${container.containerLevel}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-700">{container.containerLevel}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(container.lastUpdatedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleCollectContainer(container.containerId)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Schedule Collection
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fullContainers.length > 3 && (
              <div className="bg-gray-50 px-6 py-3 text-right">
                <button
                  onClick={() => navigate('/admin/containers/full')}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  View all {fullContainers.length} containers
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Pickups list */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <h2 className="text-xl font-semibold text-green-700 p-6 border-b">
          Waste Collection Requests
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : pickups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>No pickup requests found</p>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="mt-2 text-green-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pickups.map((pickup) => (
                  <tr key={pickup._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => viewPickupDetails(pickup._id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        {pickup.confirmationId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pickup.scheduledDate)}<br/>
                      {pickup.scheduledTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pickup.wasteType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">{pickup.address}</div>
                      <div className="text-xs text-gray-400">{pickup.province}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={pickup.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pickup.assignedStaff || (
                        <span className="text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex space-x-2">
                        {pickup.status === 'Scheduled' && (
                          <button
                            onClick={() => handleAssignStaff(pickup)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Assign
                          </button>
                        )}
                        {pickup.status === 'In Progress' && (
                          <button
                            onClick={() => handleCompletePickup(pickup)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => viewPickupDetails(pickup._id)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-l-md border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 border-t border-b ${
                  currentPage === i + 1
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
      
      {/* Modals */}
      <StaffAssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        pickup={selectedPickup}
        onSuccess={handleActionSuccess}
      />
      
      <CompletePickupModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        pickup={selectedPickup}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
};

export default WasteCollectionManagement;