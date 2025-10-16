import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContainerService from '../../services/containerService';
import { AlertBanner } from '../../components/admin';
import { formatDate } from '../../utils/formatters';

const ContainerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelHistory, setLevelHistory] = useState([]);
  const [collectionHistory, setCollectionHistory] = useState([]);

  // Fetch container details
  useEffect(() => {
    const fetchContainerDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await ContainerService.getContainerById(id);
        setContainer(data);
        
        // In a real application, these would be separate API calls
        // For this demo we'll simulate them
        setLevelHistory([
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), level: 20 },
          { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), level: 35 },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), level: 45 },
          { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), level: 60 },
          { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), level: 72 },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), level: 85 },
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), level: data.containerLevel || 90 }
        ]);
        
        setCollectionHistory([
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), amount: 25, staff: 'John Doe' },
          { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), amount: 32, staff: 'Jane Smith' }
        ]);
      } catch (err) {
        console.error('Error fetching container details:', err);
        setError('Failed to load container details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContainerDetails();
  }, [id]);
  
  // Handle collect container
  const handleCollectContainer = async () => {
    try {
      await ContainerService.scheduleCollection(container.containerId);
      navigate('/admin/waste-collection');
    } catch (error) {
      console.error('Error scheduling collection:', error);
      setError('Failed to schedule container collection');
    }
  };
  
  // Handle maintenance
  const handleMarkForMaintenance = async () => {
    try {
      await ContainerService.markForMaintenance(container.containerId);
      // Refresh container data
      const updatedContainer = await ContainerService.getContainerById(id);
      setContainer(updatedContainer);
    } catch (error) {
      console.error('Error marking for maintenance:', error);
      setError('Failed to mark container for maintenance');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <AlertBanner title="Error" type="error">
          {error}
        </AlertBanner>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!container) {
    return (
      <div className="container mx-auto px-4 py-6">
        <AlertBanner title="Not Found" type="warning">
          The requested container could not be found.
        </AlertBanner>
        <button
          onClick={() => navigate('/admin/containers')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Container Management
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Container Details</h1>
        <button
          onClick={() => navigate('/admin/containers')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Container List
        </button>
      </div>
      
      {/* Container summary card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-green-700">
                Container #{container.containerId}
              </h2>
              <div className="mt-2 text-sm text-gray-500">
                {container.location}, {container.province}
              </div>
            </div>
            <ContainerStatusBadge status={container.status} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Container Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-gray-500">Container ID:</span>
                  <span className="font-medium">{container.containerId}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">Status:</span>
                  <ContainerStatusBadge status={container.status} />
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">Waste Type:</span>
                  <span className="font-medium">{container.wasteType}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">Capacity:</span>
                  <span className="font-medium">{container.capacity || 'Standard'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-500">Fill Level:</span>
                  <div className="flex-1 flex items-center">
                    <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getColorByLevel(container.containerLevel)}`}
                        style={{ width: `${container.containerLevel}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{container.containerLevel}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Location Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-gray-500">Address:</span>
                  <span className="font-medium">{container.location}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">Province:</span>
                  <span className="font-medium">{container.province}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">GPS:</span>
                  <span className="font-medium">
                    {container.latitude ? `${container.latitude}, ${container.longitude}` : 'Not available'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-500">Last Updated:</span>
                  <span className="font-medium">{formatDate(container.lastUpdatedDate)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            {(container.status === 'Available' || container.status === 'Full') && (
              <button
                onClick={handleCollectContainer}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Schedule Collection
              </button>
            )}
            
            {container.status !== 'Needs Maintenance' && container.status !== 'Out of Service' && (
              <button
                onClick={handleMarkForMaintenance}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Mark for Maintenance
              </button>
            )}
            
            {container.status === 'Needs Maintenance' && (
              <button
                onClick={async () => {
                  try {
                    await ContainerService.completeMaintenance(container.containerId);
                    const updatedContainer = await ContainerService.getContainerById(id);
                    setContainer(updatedContainer);
                  } catch (error) {
                    setError('Failed to complete maintenance');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Maintenance
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Fill Level History */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-green-700">Fill Level History (Last 7 Days)</h2>
        </div>
        <div className="p-6">
          <div className="h-60">
            <div className="h-48 flex items-end justify-between">
              {levelHistory.map((entry, index) => (
                <div key={index} className="flex flex-col items-center justify-end" style={{ width: `${100 / levelHistory.length}%` }}>
                  <div 
                    className={`w-8 ${getColorByLevel(entry.level)}`} 
                    style={{ height: `${entry.level * 0.48}px` }}
                  ></div>
                  <span className="mt-2 text-xs text-gray-500">
                    {entry.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <div>0%</div>
              <div>25%</div>
              <div>50%</div>
              <div>75%</div>
              <div>100%</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Collection History */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-green-700">Collection History</h2>
        </div>
        {collectionHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No collection history available for this container.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collectionHistory.map((collection, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(collection.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.amount} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.staff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

export default ContainerDetails;