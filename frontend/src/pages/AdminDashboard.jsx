import React from 'react';

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-green-700 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Waste Statistics</h2>
          <p className="text-gray-600">View waste management statistics here</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Upcoming Collections</h2>
          <p className="text-gray-600">Next collection is scheduled for tomorrow</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Reward Points</h2>
          <p className="text-gray-600">250 points earned this month</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
