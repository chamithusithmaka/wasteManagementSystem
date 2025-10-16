// Validation helpers for auth

export function validateSignup({ name, username, email, password }) {
  if (!name || !username || !email || !password) {
    return 'All fields are required.';
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters long.';
  }
  
  if (!isValidEmail(email)) {
    return 'Please provide a valid email.';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  
  return null;
}

// Validate login input
export function validateLogin({ username, password }) {
  if (!username || !password) {
    return 'Username and password are required.';
  }
  
  return null;
}

// Validate waste pickup request
export function validateWastePickup({ address, province, wasteType, scheduledDate, scheduledTime }) {
  if (!address || !province || !wasteType || !scheduledDate || !scheduledTime) {
    return 'Address, province, waste type, date, and time are required.';
  }
  
  // Validate waste type
  const validWasteTypes = ['Recyclables', 'General Waste', 'Compost', 'Hazardous'];
  if (!validWasteTypes.includes(wasteType)) {
    return 'Invalid waste type. Must be one of: Recyclables, General Waste, Compost, Hazardous';
  }
  
  // Check if date is valid
  const pickupDate = new Date(scheduledDate);
  if (isNaN(pickupDate.getTime())) {
    return 'Invalid date format.';
  }
  
  // Check if date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (pickupDate < today) {
    return 'Pickup date cannot be in the past.';
  }
  
  // Check time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(scheduledTime)) {
    return 'Invalid time format. Use HH:MM format.';
  }
  
  return null;
}

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
