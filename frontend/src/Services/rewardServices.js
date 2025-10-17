const API_URL = "http://localhost:5000/api/rewards";

// Helper to get auth token
const getAuthToken = () => {
  // Get token from localStorage or another auth manager in your app
  return localStorage.getItem('token'); // Adjust this to how you store tokens
};

// Get rewards for the authenticated user or a specific resident
export const getResidentRewards = async (residentId = null) => {
  const url = residentId ? `${API_URL}?residentId=${residentId}` : API_URL;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    }
  });
  
  if (!res.ok) throw new Error("Failed to fetch rewards");
  return await res.json();
};

// Get a specific reward by ID
export const getRewardById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    }
  });
  
  if (!res.ok) throw new Error("Failed to fetch reward");
  return await res.json();
};

// Get total rewards value for a resident
export const getTotalRewardsValue = async (residentId = null) => {
  const rewards = await getResidentRewards(residentId);
  return rewards.reduce((total, reward) => total + reward.amount, 0);
};