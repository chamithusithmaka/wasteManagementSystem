import React, { useMemo } from 'react';

/**
 * WasteCollection (User dashboard)
 * - Top analytics summary (cards)
 * - Left: Upcoming Pickups (stacked items)
 * - Right: Collection History (table)
 *
 * Small internal components to respect SRP and make testing easier.
 */

const samplePickups = [
  { id: 'PU-001', type: 'Recyclables', date: '2024-10-26', time: '09:00 AM - 10:00 AM', status: 'Scheduled' },
  { id: 'PU-002', type: 'General Waste', date: '2024-10-30', time: '02:00 PM - 03:00 PM', status: 'Scheduled' },
  { id: 'PU-003', type: 'Compost', date: '2024-11-02', time: '11:00 AM - 12:00 PM', status: 'Scheduled' },
];

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
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Statistic card
const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-[18px] p-5 shadow-sm">
    <div className="text-sm font-semibold text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-bold text-green-700">{value}</div>
    {subtitle && <div className="mt-1 text-xs text-gray-400">{subtitle}</div>}
  </div>
);

// Single pickup item
const PickupItem = React.memo(({ pickup }) => (
  <div className="bg-white rounded-xl p-4 mb-3 shadow-sm flex justify-between items-center">
    <div>
      <div className="text-sm text-gray-500 font-medium">{pickup.type}, {new Date(pickup.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      <div className="text-xs text-gray-400 mt-1">{pickup.time}</div>
    </div>
    <div className="ml-4">
      <StatusBadge status={pickup.status} />
    </div>
  </div>
));

// History row
const HistoryRow = ({ row }) => (
  <tr className="odd:bg-white even:bg-green-50">
    <td className="py-3 px-4 text-sm text-gray-700">{new Date(row.date).toLocaleDateString()}</td>
    <td className="py-3 px-4 text-sm text-gray-700">{row.type}</td>
    <td className="py-3 px-4"><StatusBadge status={row.status} /></td>
    <td className="py-3 px-4 text-sm text-gray-500">{row.conf}</td>
  </tr>
);

const WasteCollection = () => {
  // analytics computed from data - useMemo for performance
  const analytics = useMemo(() => {
    const upcoming = samplePickups.length;
    const completedThisMonth = sampleHistory.filter(h => h.status === 'Completed' && new Date(h.date).getMonth() === new Date().getMonth()).length;
    // fake average fill level from last 5 collections (0-100)
    const fillSamples = [45, 60, 50, 70, 55];
    const avgFill = Math.round(fillSamples.reduce((s, v) => s + v, 0) / fillSamples.length);
    const rewards = 250; // example user points
    return { upcoming, completedThisMonth, avgFill, rewards };
  }, []);

  // small user-oriented analysis text
  const analysis = [
    `You have ${analytics.upcoming} scheduled pickup(s) in the next 7 days.`,
    analytics.completedThisMonth
      ? `Good job — ${analytics.completedThisMonth} collection(s) completed this month. Keep recycling!`
      : 'No completed collections recorded this month — consider scheduling more pickups.',
    `Average container fill level across your tracked containers is ${analytics.avgFill}%. Aim to keep below 80% to avoid overflow.`,
    `You have earned ${analytics.rewards} reward points. Redeem in Payments & Rewards.`,
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-700 mb-6">Waste Collection</h1>

      {/* Top analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Upcoming Pickups" value={analytics.upcoming} subtitle="Next 7 days" />
        <StatCard title="Completed this month" value={analytics.completedThisMonth} subtitle="User activity" />
        <StatCard title="Avg Fill Level" value={`${analytics.avgFill}%`} subtitle="All tracked containers" />
        <StatCard title="Reward Points" value={analytics.rewards} subtitle="Earned from recycling" />
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Pickups */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-700">Upcoming Pickups</h2>
            <button className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100">Schedule New</button>
          </div>

          <div className="space-y-2">
            {samplePickups.map(p => <PickupItem key={p.id} pickup={p} />)}
          </div>

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
                {sampleHistory.map((r, idx) => <HistoryRow key={idx} row={r} />)}
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