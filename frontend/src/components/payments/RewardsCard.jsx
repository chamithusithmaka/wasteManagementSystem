import React from 'react';

const RewardsCard = ({ rewards }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate total rewards
  const totalRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Earned Rewards</h2>
        <span className="text-sm text-gray-500">{rewards.length} records</span>
      </div>
      
      {/* Reward Rows */}
      <div className="space-y-3">
        {rewards.map(reward => (
          <div key={reward.id} className="flex justify-between items-center py-2">
            <div>
              <h3 className="text-sm font-medium text-gray-800">{reward.label}</h3>
              <p className="text-xs text-gray-500">{formatDate(reward.date)}</p>
            </div>
            <div className="text-sm font-medium text-green-600">
              +LKR {reward.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Total Row */}
      <div className="mt-5 pt-3 border-t border-dashed flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700">Total Rewards</div>
        <div className="text-lg font-bold text-green-600">
          LKR {totalRewards.toFixed(2)}
        </div>
      </div>
      
      <div className="mt-3 text-xs text-center text-gray-500">
        Rewards can be applied to your bills during checkout
      </div>
    </div>
  );
};

export default RewardsCard;