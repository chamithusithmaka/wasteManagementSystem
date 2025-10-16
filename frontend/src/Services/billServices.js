const API_URL = "http://localhost:5000/api/bills";

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get user's bills
export const getUserBills = async () => {
  try {
    const res = await fetch(`${API_URL}/my-bills`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!res.ok) throw new Error("Failed to fetch bills");
    const data = await res.json();
    return data.bills;
  } catch (error) {
    console.error("Error fetching bills:", error);
    return [];
  }
};

// Check for outstanding bills
export const checkOutstandingBills = async () => {
  try {
    const res = await fetch(`${API_URL}/check-outstanding`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!res.ok) throw new Error("Failed to check outstanding bills");
    return await res.json();
  } catch (error) {
    console.error("Error checking outstanding bills:", error);
    return { hasOutstandingBills: false, outstandingBalance: 0 };
  }
};

// Pay a bill
export const payBill = async (billId, paymentMethod) => {
  try {
    const res = await fetch(`${API_URL}/${billId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ paymentMethod })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to pay bill");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error paying bill:", error);
    throw error;
  }
};

// Pay multiple bills
export const payMultipleBills = async (billIds, paymentMethod, useWallet = false, applyRewards = false) => {
  try {
    console.log('Sending payment request:', { billIds, paymentMethod, useWallet, applyRewards });
    
    const res = await fetch(`${API_URL}/batch-pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ 
        billIds, 
        paymentMethod,
        useWallet,
        applyRewards
      })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || "Failed to pay bills");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error paying bills:", error);
    throw error;
  }
};