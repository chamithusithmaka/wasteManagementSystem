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

  // Get icon based on waste type
  const getWasteTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'recyclables':
        return '♻️';
      case 'compost':
        return '🌱';
      case 'e-waste':
        return '💻';
      case 'bottles':
        return '🧴';
      default:
        return '🗑️';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Earned Rewards</h2>
        <span className="text-sm text-gray-500">{rewards.length} rewards</span>
      </div>
      
      {rewards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No rewards earned yet</p>
          <p className="text-sm mt-2">Recycle waste to earn rewards</p>
        </div>
      ) : (
        <>
          {/* Reward Rows */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {rewards.map(reward => (
              <div key={reward.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="mr-3 text-lg">{getWasteTypeIcon(reward.type)}</div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{reward.label}</h3>
                    <p className="text-xs text-gray-500">{formatDate(reward.date)}</p>
                  </div>
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
        </>
      )}
      
      <div className="mt-3 text-xs text-center text-gray-500">
        Rewards can be applied to your bills during checkout
      </div>
    </div>
  );
};

export default RewardsCard;