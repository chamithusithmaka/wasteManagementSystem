// Auth token utility functions

// Get the auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set the auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove the auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};