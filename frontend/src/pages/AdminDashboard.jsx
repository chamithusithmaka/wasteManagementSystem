import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    wasteCollectionStats: null,
    sensorDataStats: null,
    loading: true,
    error: null
  });

  const [timeFilter, setTimeFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Color schemes for charts
  const COLORS = {
    primary: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
    secondary: ['#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#365314'],
    status: {
      'Completed': '#22c55e',
      'Scheduled': '#3b82f6', 
      'In Progress': '#f59e0b',
      'Cancelled': '#ef4444',
      'Pending': '#8b5cf6',
      'Available': '#22c55e',
      'Full': '#f59e0b',
      'Needs Maintenance': '#ef4444',
      'Out of Service': '#6b7280'
    }
  };

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch waste collection status counts
      const wasteResponse = await fetch('http://localhost:5000/api/reports/status-counts');
      const wasteData = await wasteResponse.json();
      
      // Fetch sensor data status counts  
      const sensorResponse = await fetch('http://localhost:5000/api/reports/sensor-status-counts');
      const sensorData = await sensorResponse.json();
      
      // Generate sample report data for trends
      const trendResponse = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'Waste Collection Summary' })
      });
      const trendData = await trendResponse.json();

      setDashboardData({
        wasteCollectionStats: wasteData.success ? wasteData.data : null,
        sensorDataStats: sensorData.success ? sensorData.data : null,
        trendData: trendData.success ? trendData.data : null,
        loading: false,
        error: null
      });
    } catch (err) {
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch dashboard data'
      }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeFilter]);

  // Transform data for charts
  const getChartData = (data, type = 'waste') => {
    if (!data?.counts) return [];
    
    return Object.entries(data.counts).map(([status, count]) => ({
      name: status,
      value: count,
      count: count,
      percentage: ((count / (data.total || 1)) * 100).toFixed(1),
      fill: COLORS.status[status] || COLORS.primary[0]
    }));
  };

  // Generate trend data (mock implementation - you can enhance this)
  const getTrendData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      day,
      collections: Math.floor(Math.random() * 50) + 20,
      containers: Math.floor(Math.random() * 30) + 10,
      efficiency: Math.floor(Math.random() * 30) + 70
    }));
  };

  const wasteChartData = getChartData(dashboardData.wasteCollectionStats, 'waste');
  const sensorChartData = getChartData(dashboardData.sensorDataStats, 'sensor');
  const trendData = getTrendData();

  // Calculate KPIs
  const calculateKPIs = () => {
    const waste = dashboardData.wasteCollectionStats;
    const sensor = dashboardData.sensorDataStats;
    
    return {
      totalCollections: waste?.total || 0,
      totalContainers: sensor?.total || 0,
      completionRate: waste?.counts?.['Completed'] 
        ? ((waste.counts['Completed'] / waste.total) * 100).toFixed(1)
        : '0',
      maintenanceNeeded: sensor?.counts?.['Needs Maintenance'] || 0,
      activeCollections: waste?.counts?.['In Progress'] || 0,
      availableContainers: sensor?.counts?.['Available'] || 0
    };
  };

  const kpis = calculateKPIs();

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <div className="text-green-700 font-semibold text-lg">Loading Dashboard Analytics...</div>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{dashboardData.error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time waste management insights and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Refreshing
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Collections"
          value={kpis.totalCollections}
          icon="🗂️"
          color="blue"
          trend="+12%"
        />
        <KPICard
          title="Active Collections"
          value={kpis.activeCollections}
          icon="🔄"
          color="orange"
          trend="+5%"
        />
        <KPICard
          title="Completion Rate"
          value={`${kpis.completionRate}%`}
          icon="✅"
          color="green"
          trend="+3.2%"
        />
        <KPICard
          title="Total Containers"
          value={kpis.totalContainers}
          icon="🗑️"
          color="purple"
          trend="+8%"
        />
        <KPICard
          title="Available Containers"
          value={kpis.availableContainers}
          icon="🟢"
          color="green"
          trend="-2%"
        />
        <KPICard
          title="Maintenance Needed"
          value={kpis.maintenanceNeeded}
          icon="⚠️"
          color="red"
          trend="+1"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Collection Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <span>📊</span> Waste Collection Status
          </h2>
          {wasteChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value} collections`, 'Count']}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No waste collection data available
            </div>
          )}
        </div>

        {/* Container Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <span>🔄</span> Container Status Distribution
          </h2>
          {sensorChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sensorChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percentage}) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sensorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} containers`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No container data available
            </div>
          )}
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <span>📈</span> Weekly Activity Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: '#374151', fontSize: 12 }} />
              <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="collections" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name="Collections"
              />
              <Line 
                type="monotone" 
                dataKey="containers" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Container Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <span>⚡</span> System Efficiency
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: '#374151', fontSize: 12 }} />
              <YAxis tick={{ fill: '#374151', fontSize: 12 }} domain={[60, 100]} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, 'Efficiency']}
              />
              <defs>
                <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorEfficiency)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Summary Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
            <span>📋</span> System Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Waste Collection Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Waste Collection Status</h3>
              <div className="space-y-3">
                {wasteChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{item.count}</div>
                      <div className="text-sm text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Container Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Container Status</h3>
              <div className="space-y-3">
                {sensorChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{item.count}</div>
                      <div className="text-sm text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100', 
    orange: 'bg-orange-500 text-orange-100',
    purple: 'bg-purple-500 text-purple-100',
    red: 'bg-red-500 text-red-100'
  };

  const trendColor = trend?.startsWith('+') ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center text-lg`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trendColor}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
};

export default AdminDashboard;
