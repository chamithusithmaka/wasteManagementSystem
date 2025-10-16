const API_URL = "http://localhost:5000/api/transactions";

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get user's recent transactions
export const getRecentTransactions = async (limit = 5) => {
  try {
    const res = await fetch(`${API_URL}/my-transactions?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch transactions");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Get transaction by ID
export const getTransactionById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!res.ok) throw new Error("Failed to fetch transaction");
    return await res.json();
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
};

// Add this function to your existing paymentServices.js
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



