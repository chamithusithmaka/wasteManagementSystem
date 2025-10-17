import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import WasteCollectionService from '../../services/wasteCollectionService';

/**
 * WasteCollection (User dashboard)
 * - Top analytics summary (cards)
 * - Left: Upcoming Pickups (stacked items)
 * - Right: Collection History (table)
 */

// Fallback sample data for when API fails
const sampleHistory = [
  { date: '2024-10-20', type: 'General Waste', status: 'Completed', conf: 'GC-87654' },
  { date: '2024-10-15', type: 'Recyclables', status: 'Completed', conf: 'RC-23456' },
  { date: '2024-10-10', type: 'Compost', status: 'Pending', conf: 'CP-78901' },
  { date: '2024-10-05', type: 'Hazardous', status: 'Cancelled', conf: 'HZ-11223' },
  { date: '2024-09-28', type: 'General Waste', status: 'Completed', conf: 'GC-33445' },
];

// Simple status badge component
const StatusBadge = ({ status }) => {
  const map = {
    Completed: 'bg-green-100 text-green-800',
    Scheduled: 'bg-blue-100 text-blue-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-800',
    'In Progress': 'bg-purple-100 text-purple-800'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Statistic card
const StatCard = ({ title, value, subtitle, isLoading = false }) => (
  <div className="bg-white rounded-[18px] p-5 shadow-sm">
    <div className="text-sm font-semibold text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-bold text-green-700">
      {isLoading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        value
      )}
    </div>
    {subtitle && <div className="mt-1 text-xs text-gray-400">{subtitle}</div>}
  </div>
);

// Single pickup item
const PickupItem = React.memo(({ pickup }) => {
  // Format the date nicely
  const formattedDate = new Date(pickup.date).toLocaleDateString(undefined, { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="bg-white rounded-xl p-4 mb-3 shadow-sm flex justify-between items-center">
      <div>
        <div className="text-sm text-gray-500 font-medium">
          {pickup.type || pickup.wasteType}, {formattedDate}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {pickup.address}{pickup.province ? `, ${pickup.province}` : ''}
        </div>
        <div className="text-xs text-gray-400">
          {pickup.time || pickup.scheduledTime}
        </div>
        {pickup.confirmationId && (
          <div className="text-xs text-green-600 mt-1">ID: {pickup.confirmationId}</div>
        )}
      </div>
      <div className="ml-4">
        <StatusBadge status={pickup.status} />
      </div>
    </div>
  );
});

// History row
const HistoryRow = ({ row }) => {
  const date = new Date(row.date || row.completedAt || row.scheduledDate);
  return (
    <tr className="odd:bg-white even:bg-green-50">
      <td className="py-3 px-4 text-sm text-gray-700">{date.toLocaleDateString()}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{row.type || row.wasteType}</td>
      <td className="py-3 px-4"><StatusBadge status={row.status} /></td>
      <td className="py-3 px-4 text-sm text-gray-500">{row.conf || row.confirmationId}</td>
    </tr>
  );
};

const WasteCollection = () => {
  // State for API data
  const [pickups, setPickups] = useState([]);
  const [completedPickups, setCompletedPickups] = useState([]);
  const [stats, setStats] = useState({
    completedThisMonth: 0,
    upcomingPickups: 0,
    avgFill: 50
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get scheduled pickups
        const scheduledPickups = await WasteCollectionService.getUserPickups('Scheduled');
        setPickups(scheduledPickups);
        
        // Get completed pickups
        const completed = await WasteCollectionService.getUserPickups('Completed');
        setCompletedPickups(completed);
        
        // Get user stats
        const userStats = await WasteCollectionService.getUserStats();
        setStats(userStats);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute analytics values
  const analytics = useMemo(() => {
    return {
      upcoming: stats.upcomingPickups || pickups.length,
      completedThisMonth: stats.completedThisMonth || 0,
      avgFill: stats.avgFill || 50,
      rewards: 250 // Placeholder for rewards - would come from a rewards service
    };
  }, [pickups.length, stats]);

  // Generate analysis text
  const analysis = useMemo(() => {
    return [
      `You have ${analytics.upcoming} scheduled pickup(s) in the next 7 days.`,
      analytics.completedThisMonth
        ? `Good job — ${analytics.completedThisMonth} collection(s) completed this month. Keep recycling!`
        : 'No completed collections recorded this month — consider scheduling more pickups.',
      `Average container fill level across your tracked containers is ${analytics.avgFill}%. Aim to keep below 80% to avoid overflow.`,
      `You have earned ${analytics.rewards} reward points. Redeem in Payments & Rewards.`,
    ];
  }, [analytics]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-700 mb-6">Waste Collection</h1>

      {/* Error message if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Top analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Upcoming Pickups" 
          value={analytics.upcoming} 
          subtitle="Next 7 days"
          isLoading={loading} 
        />
        <StatCard 
          title="Completed this month" 
          value={analytics.completedThisMonth} 
          subtitle="User activity"
          isLoading={loading} 
        />
        
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Pickups */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-700">Upcoming Pickups</h2>

            <Link
              to="/schedule"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-green-700 to-green-500 shadow hover:scale-[1.02] transform transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" stroke="white" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              Schedule New
            </Link>
          </div>

          {loading ? (
            // Loading state
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-20 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : pickups.length === 0 ? (
            // Empty state
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p>No scheduled pickups yet.</p>
              <p className="text-sm mt-2">Click "Schedule New" to arrange your first waste collection.</p>
            </div>
          ) : (
            // List of pickups
            <div className="space-y-2">
              {pickups.map(pickup => (
                <div key={pickup._id || pickup.id} className="animate-fade-up">
                  <PickupItem pickup={pickup} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <strong>Suggested action:</strong> {analytics.avgFill > 75 ? 'Request earlier pickup for heavily filled containers.' : 'Containers are within acceptable fill levels.'}
          </div>
        </div>

        {/* Right: Collection History */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-700">Collection History</h2>
            <div className="text-sm text-gray-500">Conf. IDs shown</div>
          </div>

          <div className="overflow-hidden rounded-lg border border-green-100">
            <table className="w-full table-fixed">
              <thead className="bg-green-50 text-left">
                <tr>
                  <th className="py-3 px-4 text-xs text-gray-500">Date</th>
                  <th className="py-3 px-4 text-xs text-gray-500">Type</th>
                  <th className="py-3 px-4 text-xs text-gray-500">Status</th>
                  <th className="py-3 px-4 text-xs text-gray-500">Conf. ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Loading state
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="4" className="py-3">
                        <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : completedPickups.length > 0 ? (
                  // API data
                  completedPickups.map(pickup => <HistoryRow key={pickup._id || pickup.id} row={pickup} />)
                ) : (
                  // Fallback to sample data
                  sampleHistory.map((row, idx) => <HistoryRow key={idx} row={row} />)
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              {analysis.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteCollection;