import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trash2,
  AlertTriangle,
  Calendar,
  CheckCircle,
  BarChart2,
  List,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import StatCard from '../../components/ContainerManagement/StatCard'
import containerService from '../../services/containerService'

const ContainerDashboard = () => {
  const navigate = useNavigate()
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardStats, setDashboardStats] = useState({
    totalContainers: 0,
    containersNearFull: 0,
    scheduledPickups: 0,
    completedPickups: 0,
    activeAlerts: 0
  })

  // Fetch containers from API
  useEffect(() => {
    fetchContainers()
  }, [])

  const fetchContainers = async () => {
    try {
      setLoading(true)
      const response = await containerService.getAllContainers()
      const containersData = response.data || response
      setContainers(containersData)
      calculateStats(containersData)
      setError(null)
    } catch (err) {
      console.error('Error fetching containers:', err)
      setError(err.response?.data?.error || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (containersData) => {
    const total = containersData.length
    const nearFull = containersData.filter(c => c.containerLevel >= 80).length
    const hasErrors = containersData.filter(c => c.isErrorDetected).length
    const scheduledPickups = containersData.filter(c => c.collectionSchedule && new Date(c.collectionSchedule) > new Date()).length
    const completedPickups = containersData.filter(c => c.lastCollectionDate).length

    setDashboardStats({
      totalContainers: total,
      containersNearFull: nearFull,
      scheduledPickups: scheduledPickups,
      completedPickups: completedPickups,
      activeAlerts: hasErrors
    })
  }

  // Generate fill level distribution data
  const generateFillLevelDistribution = () => {
    const ranges = [
      { range: '0-20%', min: 0, max: 20 },
      { range: '21-40%', min: 21, max: 40 },
      { range: '41-60%', min: 41, max: 60 },
      { range: '61-80%', min: 61, max: 80 },
      { range: '81-100%', min: 81, max: 100 }
    ]

    return ranges.map(range => ({
      range: range.range,
      count: containers.filter(c => 
        c.containerLevel >= range.min && c.containerLevel <= range.max
      ).length
    }))
  }



  const highPriorityContainers = containers
    .filter((c) => c.containerLevel >= 80 || c.isErrorDetected)
    .slice(0, 5)

  // Generate recent alerts from containers with errors
  const recentAlerts = containers
    .filter(c => c.isErrorDetected)
    .map((container, index) => ({
      id: `alert-${index}`,
      containerId: container.containerId,
      location: container.containerLocation?.address || 'N/A',
      city: container.containerLocation?.city || 'N/A',
      type: 'Sensor Error',
      description: `Container sensor malfunction detected at ${container.containerLocation?.city || 'Unknown location'}`,
      timestamp: container.lastUpdatedDate || new Date().toISOString(),
      fillLevel: container.containerLevel,
      resolved: false
    }))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Container Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Container Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchContainers}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Container Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Containers"
          value={dashboardStats.totalContainers}
          icon={<Trash2 size={20} />}
          color="border-green-500"
        />
        <StatCard
          title="Near Full Containers"
          value={dashboardStats.containersNearFull}
          icon={<BarChart2 size={20} />}
          color="border-yellow-500"
        />
        <StatCard
          title="Scheduled Pickups"
          value={dashboardStats.scheduledPickups}
          icon={<Calendar size={20} />}
          color="border-blue-500"
        />
        <StatCard
          title="Completed Pickups"
          value={dashboardStats.completedPickups}
          icon={<CheckCircle size={20} />}
          color="border-green-500"
        />
        <StatCard
          title="Active Alerts"
          value={dashboardStats.activeAlerts}
          icon={<AlertTriangle size={20} />}
          color="border-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fill Level Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Container Fill Level Distribution
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={generateFillLevelDistribution()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Container Count" fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sensor Status Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Sensor Status Overview</h2>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800">Active Sensors</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {containers.filter(c => !c.isErrorDetected).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Detected</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {containers.filter(c => c.isErrorDetected).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">Total Containers</h3>
                  <p className="text-2xl font-bold text-gray-600">
                    {containers.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart2 className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Health Meter */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Overall Sensor Health</div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${containers.length > 0 ? ((containers.filter(c => !c.isErrorDetected).length / containers.length) * 100) : 0}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>0%</span>
              <span className="font-semibold text-green-600">
                {containers.length > 0 ? Math.round(((containers.filter(c => !c.isErrorDetected).length / containers.length) * 100)) : 0}% Operational
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Container List Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/container-management')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-md"
        >
          <List size={20} />
          View Container List
        </button>
      </div>

      {/* High Priority Containers */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">High Priority Containers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fill Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sensor Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Container Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {highPriorityContainers.length > 0 ? (
                highPriorityContainers.map((container) => (
                  <tr key={container._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {container.containerId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs">
                        <div className="truncate">{container.containerLocation?.address || 'N/A'}</div>
                        {container.containerLocation?.coordinates?.latitude && container.containerLocation?.coordinates?.longitude && (
                          <div className="text-xs text-gray-400">
                            {container.containerLocation.coordinates.latitude.toFixed(4)}, {container.containerLocation.coordinates.longitude.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {container.containerLocation?.city || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              container.containerLevel >= 90
                                ? 'bg-red-500'
                                : container.containerLevel >= 80
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${container.containerLevel}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {container.containerLevel}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {container.isErrorDetected ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <AlertTriangle size={12} className="mr-1" />
                          Error
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        container.status === 'Available' ? 'bg-green-100 text-green-800' :
                        container.status === 'Near Full' ? 'bg-yellow-100 text-yellow-800' :
                        container.status === 'Full' ? 'bg-red-100 text-red-800' :
                        container.status === 'Needs Maintenance' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {container.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(container.lastUpdatedDate).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No high priority containers
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Alerts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Container
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fill Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.containerId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate">{alert.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        {alert.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate">{alert.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className={`h-1.5 rounded-full ${
                              alert.fillLevel >= 90 ? 'bg-red-500' :
                              alert.fillLevel >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${alert.fillLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{alert.fillLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {alert.resolved ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Resolved
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No recent alerts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ContainerDashboard
