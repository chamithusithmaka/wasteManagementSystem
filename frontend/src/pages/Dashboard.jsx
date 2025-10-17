import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WasteCollectionService from '../services/wasteCollectionService';

// Skeleton loader component
const CardSkeleton = () => (
  <div className="animate-pulse bg-white p-6 rounded-xl shadow-md">
    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
  </div>
);

// Stat card component with animation
const StatCard = ({ icon, title, value, subtitle, color, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-l-4" style={{ borderLeftColor: color }}>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center mb-3">
            <div className="mr-3 p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
              {icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
          <div className="text-3xl font-bold" style={{ color }}>{value}</div>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </>
      )}
    </div>
  );
};

// Chart card component
const ChartCard = ({ title, children, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {isLoading ? (
        <div className="animate-pulse flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 rounded-full border-4 border-t-green-500 border-gray-200 animate-spin"></div>
          <div className="mt-4 text-sm text-gray-400">Loading chart data...</div>
        </div>
      ) : (
        <div className="h-64">
          {children}
        </div>
      )}
    </div>
  );
};

// Activity item component
const ActivityItem = ({ date, title, status, icon }) => {
  const statusColors = {
    Scheduled: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
    'In Progress': 'bg-purple-100 text-purple-700',
    Pending: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="flex items-start mb-4 p-3 rounded-lg transition-all duration-300 hover:bg-gray-50">
      <div className="bg-gray-100 p-2 rounded-full mr-3">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
          </span>
        </div>
        <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}</p>
      </div>
    </div>
  );
};

// Payment preview card component
const PaymentPreviewCard = ({ dueAmount, lastPayment, nextDue }) => {
  return (
    <div className="bg-gradient-to-br from-green-700 to-green-500 text-white p-6 rounded-xl shadow-md animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Payments Overview</h2>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-white/80">Due Amount</p>
          <p className="text-xl font-bold">${dueAmount}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-white/80">Last Payment</p>
          <p>${lastPayment}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-white/80">Next Due</p>
          <p>{nextDue}</p>
        </div>
        <Link
          to="/payments"
          className="mt-2 bg-white text-green-600 py-2 px-4 rounded-lg text-center font-medium hover:bg-green-50 transition-colors duration-300"
        >
          View All Payments
        </Link>
      </div>
    </div>
  );
};

const Dashboard = () => {
  // Debug log to check if Dashboard component mounts
  console.log('Dashboard component mounted/rendered');
  
  // State for API data
  const [pickups, setPickups] = useState([]);
  const [completedPickups, setCompletedPickups] = useState([]);
  const [stats, setStats] = useState({
    completedThisMonth: 0,
    upcomingPickups: 0,
    avgFill: 50,
    rewards: 250
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get scheduled pickups
        const scheduledPickups = await WasteCollectionService.getUserPickups('Scheduled');
        setPickups(scheduledPickups);
        
        // Get completed pickups for history
        const completed = await WasteCollectionService.getUserPickups('Completed');
        setCompletedPickups(completed);
        
        // Get user stats
        const userStats = await WasteCollectionService.getUserStats();
        setStats({
          ...userStats,
          rewards: 250 // Placeholder since rewards API not implemented yet
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        // Simulate slight delay for animation effect
        setTimeout(() => {
          setLoading(false);
        }, 600);
      }
    };

    fetchData();
  }, []);

  // Process waste type distribution for pie chart
  const wasteTypeData = useMemo(() => {
    const allPickups = [...completedPickups, ...pickups];
    const distribution = {};
    
    allPickups.forEach(pickup => {
      const type = pickup.wasteType || 'Other';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    
    return Object.keys(distribution).map(key => ({
      name: key,
      value: distribution[key]
    }));
  }, [completedPickups, pickups]);

  // Process collection history for line chart (monthly counts)
  const collectionHistoryData = useMemo(() => {
    const months = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize with past 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (new Date().getMonth() - i + 12) % 12;
      const monthName = new Date(0, monthIndex).toLocaleString('default', { month: 'short' });
      months[`${monthName}`] = 0;
    }
    
    // Count completed pickups by month
    completedPickups.forEach(pickup => {
      const date = new Date(pickup.scheduledDate || pickup.date);
      if (date.getFullYear() === currentYear) {
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (months[monthName] !== undefined) {
          months[monthName]++;
        }
      }
    });
    
    return Object.keys(months).map(month => ({
      month,
      collections: months[month]
    }));
  }, [completedPickups]);

  // COLORS for charts
  const WASTE_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];
  
  // Recent activity - combine scheduled and completed
  const recentActivity = useMemo(() => {
    const combined = [...pickups, ...completedPickups]
      .sort((a, b) => new Date(b.scheduledDate || b.date) - new Date(a.scheduledDate || a.date))
      .slice(0, 5); // Only take 5 most recent
    
    return combined;
  }, [pickups, completedPickups]);

  // Payment placeholder data (for demo)
  const paymentData = {
    dueAmount: 43.50,
    lastPayment: 28.75,
    nextDue: 'Oct 30, 2025'
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page title */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-700">User Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
          title="Upcoming Pickups"
          value={stats.upcomingPickups || pickups.length}
          subtitle="Scheduled for collection"
          color="#3b82f6"
          isLoading={loading}
        />
        
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>}
          title="Completed"
          value={stats.completedThisMonth || 0}
          subtitle="Collections this month"
          color="#22c55e"
          isLoading={loading}
        />
        
      </div>

      {/* Middle Section - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <ChartCard title="Collection History" isLoading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={collectionHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip 
                formatter={(value) => [`${value} collections`, 'Collections']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="collections" 
                stroke="#16a34a" 
                strokeWidth={2} 
                dot={{ stroke: '#16a34a', strokeWidth: 2, fill: '#fff', r: 4 }}
                activeDot={{ stroke: '#16a34a', strokeWidth: 2, fill: '#16a34a', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie Chart */}
        <ChartCard title="Waste Type Distribution" isLoading={loading}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={wasteTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {wasteTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={WASTE_COLORS[index % WASTE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} pickups`, name]}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Section - Recent Activity and Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-md animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <Link to="/waste-collection" className="text-green-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start p-3">
                    <div className="bg-gray-200 h-10 w-10 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={activity._id || `activity-${index}`}
                    date={activity.scheduledDate || activity.date}
                    title={`${activity.wasteType || activity.type} Collection`}
                    status={activity.status}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p>No activity yet.</p>
                <p className="text-sm mt-2">Schedule a pickup to get started.</p>
                <Link
                  to="/waste-collection/schedule"
                  className="mt-4 inline-block bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Schedule Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          {loading ? (
            <CardSkeleton />
          ) : (
            <PaymentPreviewCard
              dueAmount={paymentData.dueAmount}
              lastPayment={paymentData.lastPayment}
              nextDue={paymentData.nextDue}
            />
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link
          to="/waste-collection/schedule"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Schedule Pickup
        </Link>
        
        <Link
          to="/waste-level"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Container Levels
        </Link>
        
        <Link
          to="/payments"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Payments & Rewards
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;