const API_URL = "http://localhost:5000/api/wallet";


// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const sendReceiptEmail = async (email, receipt) => {
  try {
    const response = await fetch(`${API_URL}/send-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ email, receipt })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send receipt');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
  }
};

export const getRecentTransactions = async (residentId, limit = 5) => {
  const res = await fetch(`${API_URL}/${residentId}/recent?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch recent transactions");
  return await res.json();
};

// Get wallet by residentId
export const getWallet = async (residentId) => {
  try {
    const res = await fetch(`${API_URL}/my-wallet`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch wallet");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error fetching wallet:", error);
    throw error;
  }
};

// Add funds to wallet
export const addFunds = async (residentId, amount) => {
  const res = await fetch(`${API_URL}/add-funds`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to add funds");
  }
  
  return await res.json();
};

// Get wallet transactions
export const getWalletTransactions = async (residentId) => {
  const res = await fetch(`${API_URL}/${residentId}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return await res.json();
};