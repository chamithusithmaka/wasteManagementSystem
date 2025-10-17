import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ContainerService from '../../services/containerService';
import { AlertBanner } from '../../components/admin';
import { formatDate } from '../../utils/formatters';

const ContainerManagement = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [priorityContainers, setPriorityContainers] = useState([]);
  const [showPrioritySection, setShowPrioritySection] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we should filter for full containers
  useEffect(() => {
    if (location.pathname.includes('/full')) {
      setStatusFilter('Full');
    }
  }, [location]);
  
  // Fetch containers
  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let result;
        if (statusFilter) {
          result = await ContainerService.getContainersByStatus(statusFilter, currentPage);
        } else {
          result = await ContainerService.getAllContainers(currentPage);
        }
        
        setContainers(result.containers || result || []);
        setTotalPages(result.totalPages || 1);
      } catch (err) {
        console.error('Error fetching containers:', err);
        setError('Failed to load containers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
  }, [currentPage, statusFilter, refreshTrigger]);
  
  // Fetch priority containers (Full and Near Full)
  useEffect(() => {
    const fetchPriorityContainers = async () => {
      try {
        // Only fetch priority containers when on the main view (no status filter)
        if (statusFilter === '') {
          // Fetch Full containers
          const fullContainers = await ContainerService.getContainersByStatus('Full');
          
          // Fetch Near Full containers
          const nearFullContainers = await ContainerService.getContainersByStatus('Near Full');
          
          // Combine and sort by level (highest first)
          const combined = [
            ...(fullContainers.containers || fullContainers || []),
            ...(nearFullContainers.containers || nearFullContainers || [])
          ].sort((a, b) => b.containerLevel - a.containerLevel);
          
          setPriorityContainers(combined);
        } else {
          setPriorityContainers([]);
        }
      } catch (err) {
        console.error('Error fetching priority containers:', err);
        // Don't show error for this section, just hide it
        setPriorityContainers([]);
        setShowPrioritySection(false);
      }
    };
    
    fetchPriorityContainers();
  }, [statusFilter, refreshTrigger]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  
  // Schedule container collection
  const handleCollectContainer = async (containerId) => {
    try {
      await ContainerService.scheduleCollection(containerId);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error scheduling container collection:', error);
      setError('Failed to schedule container collection');
    }
  };
  
  // Mark container for maintenance
  const handleMarkForMaintenance = async (containerId) => {
    try {
      await ContainerService.markForMaintenance(containerId);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error marking container for maintenance:', error);
      setError('Failed to mark container for maintenance');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Container Management</h1>
        <button
          onClick={() => navigate('/admin/waste-collection')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Collections
        </button>
      </div>
      
      {error && (
        <AlertBanner title="Error" type="error" className="mb-6">
          {error}
        </AlertBanner>
      )}
      
      {/* Containers requiring attention section */}
      {showPrioritySection && priorityContainers.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-amber-700">
              Containers Requiring Attention ({priorityContainers.length})
            </h2>
            <button 
              onClick={() => setShowPrioritySection(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priorityContainers.map((container) => (
                  <tr key={`priority-${container._id}`} className="hover:bg-amber-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{container.containerId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{container.containerLocation?.address || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{container.containerLocation?.province || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{container.containerType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getColorByLevel(container.containerLevel)}`}
                            style={{ width: `${container.containerLevel}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-700">{container.containerLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ContainerStatusBadge status={container.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCollectContainer(container.containerId)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          Schedule Pickup
                        </button>
                        <button
                          onClick={() => navigate(`/admin/containers/${container._id}`)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
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
        </div>
      )}
      
      {/* Filter controls */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="">All Containers</option>
          <option value="Available">Available</option>
          <option value="Near Full">Near Full</option>
          <option value="Full">Full</option>
          <option value="Needs Maintenance">Needs Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </select>
      </div>
      
      {/* Containers list */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <h2 className="text-xl font-semibold text-green-700 p-6 border-b">
          {statusFilter ? `${statusFilter} Containers` : 'All Containers'}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : containers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>No containers found</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Collection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {containers.map((container) => (
                  <tr key={container._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{container.containerId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{container.containerLocation?.address || container.location || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{container.containerLocation?.province || container.province || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{container.containerType || container.wasteType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getColorByLevel(container.containerLevel)}`}
                            style={{ width: `${container.containerLevel}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-700">{container.containerLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ContainerStatusBadge status={container.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {container.lastCollectionDate ? formatDate(container.lastCollectionDate) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {(container.status === 'Full' || container.status === 'Near Full' || container.status === 'Available') && (
                          <button
                            onClick={() => handleCollectContainer(container.containerId)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                          >
                            {container.status === 'Full' || container.status === 'Near Full' ? 'Schedule Pickup' : 'Collect'}
                          </button>
                        )}
                        {container.status !== 'Needs Maintenance' && container.status !== 'Out of Service' && (
                          <button
                            onClick={() => handleMarkForMaintenance(container.containerId)}
                            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
                          >
                            Maintenance
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/containers/${container._id}`)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
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
    </div>
  );
};

// Helper function to determine color based on fill level
const getColorByLevel = (level) => {
  if (level >= 90) return 'bg-red-500';
  if (level >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Container status badge
const ContainerStatusBadge = ({ status }) => {
  const statusStyles = {
    'Available': 'bg-green-100 text-green-800',
    'Near Full': 'bg-yellow-100 text-yellow-800',
    'Full': 'bg-red-100 text-red-800',
    'Needs Maintenance': 'bg-yellow-100 text-yellow-800',
    'Out of Service': 'bg-gray-100 text-gray-800'
  };
  
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
};

export default ContainerManagement;