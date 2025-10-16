const API_URL = "http://localhost:5000/api/wallet";


export const sendReceiptEmail = async (email, receipt) => {
  const res = await fetch(`${API_URL}/email-receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, receipt }),
  });
  if (!res.ok) throw new Error("Failed to send receipt email");
  return await res.json();
};

export const getRecentTransactions = async (residentId, limit = 5) => {
  const res = await fetch(`${API_URL}/${residentId}/recent?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch recent transactions");
  return await res.json();
};

// Get wallet by residentId
export const getWallet = async (residentId) => {
  const res = await fetch(`${API_URL}/${residentId}`);
  if (!res.ok) throw new Error("Failed to fetch wallet");
  return await res.json();
};

// Add funds to wallet
export const addFunds = async (residentId, amount, method = "manual", email) => {
  const res = await fetch(`${API_URL}/${residentId}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, method, email }),
  });
  if (!res.ok) throw new Error("Failed to add funds");
  return await res.json();
};

// Get wallet transactions
export const getWalletTransactions = async (residentId) => {
  const res = await fetch(`${API_URL}/${residentId}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return await res.json();
};