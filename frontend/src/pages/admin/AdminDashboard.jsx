import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WasteCollectionService from '../../services/wasteCollectionService';
import ContainerService from '../../services/containerService';

// Activity Item Component
const ActivityItem = ({ time, description, location, status }) => {
  const statusStyles = {
    Warning: "bg-yellow-100 text-yellow-800",
    Success: "bg-green-100 text-green-800",
    Error: "bg-red-100 text-red-800",
    Info: "bg-blue-100 text-blue-800"
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{description}</p>
          <p className="text-xs text-gray-500">{location}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
          <span className="mt-1 text-xs text-gray-500">{time}</span>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    scheduledPickups: 0,
    inProgressPickups: 0,
    completedToday: 0,
    totalContainers: 0,
    fullContainers: 0,
    maintenanceRequired: 0,
    totalUsers: 0,
    totalWasteCollected: 0,
    recyclingRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real application, these would be actual API calls
        // Simulating API data for this example
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          scheduledPickups: 24,
          inProgressPickups: 12,
          completedToday: 18,
          totalContainers: 125,
          fullContainers: 8,
          maintenanceRequired: 3,
          totalUsers: 1250,
          totalWasteCollected: 4582,
          recyclingRate: 42
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-700 mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Waste Collection Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Scheduled Pickups</span>
              <span className="font-semibold">
                {loading ? (
                  <div className="w-6 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.scheduledPickups
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold">
                {loading ? (
                  <div className="w-6 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.inProgressPickups
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Today</span>
              <span className="font-semibold">
                {loading ? (
                  <div className="w-6 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.completedToday
                )}
              </span>
            </div>
          </div>
          <Link to="/admin/waste-collection" className="mt-4 block w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center">
            Manage Waste Collection
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Container Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Containers</span>
              <span className="font-semibold">
                {loading ? (
                  <div className="w-8 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalContainers
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Containers 90% Full</span>
              <span className="font-semibold text-red-600">
                {loading ? (
                  <div className="w-4 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.fullContainers
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Maintenance Required</span>
              <span className="font-semibold text-yellow-600">
                {loading ? (
                  <div className="w-4 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.maintenanceRequired
                )}
              </span>
            </div>
          </div>
          <Link to="/admin/containers" className="mt-4 block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
            View Container Status
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-green-700 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-semibold">
                {loading ? (
                  <div className="w-12 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalUsers.toLocaleString()
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Waste Collected</span>
              <span className="font-semibold">
                {loading ? (
                  <div className="w-16 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${stats.totalWasteCollected.toLocaleString()} kg`
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recycling Rate</span>
              <span className="font-semibold text-green-600">
                {loading ? (
                  <div className="w-8 h-3 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${stats.recyclingRate}%`
                )}
              </span>
            </div>
          </div>
          <Link to="/admin/reports" className="mt-4 block w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center">
            Generate Reports
          </Link>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-green-700">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-6 animate-pulse flex items-start">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-12"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <ActivityItem 
                  time="10:45 AM" 
                  description="Container #B245 reached 95% capacity" 
                  location="North Region, Zone 3"
                  status="Warning"
                />
                <ActivityItem 
                  time="09:30 AM" 
                  description="Waste collection completed" 
                  location="Central District, Block 7"
                  status="Success"
                />
                <ActivityItem 
                  time="08:15 AM" 
                  description="Staff assigned to pickup request #WP-3482" 
                  location="Eastern Zone, Sector 2"
                  status="Info"
                />
                <ActivityItem 
                  time="Yesterday" 
                  description="Maintenance performed on Container #A112" 
                  location="Southern Region, Zone 8"
                  status="Info"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
