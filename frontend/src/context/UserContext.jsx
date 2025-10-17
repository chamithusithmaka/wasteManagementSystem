import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(undefined);

const HARDCODED_USERS = [
  { id: 'u1', username: 'user1', password: 'pass1', role: 'user', email: 'sithma2002@gmail.com' },
  { id: 'a1', username: 'admin', password: 'adminpass', role: 'admin', email: 'sithma2002@gmail.com' }
];

export const UserProvider = ({ children }) => {
  // Set the default user to the first hardcoded user
  const [user, setUser] = useState(HARDCODED_USERS[0]);

  // If not already done in your UserContext, update login to store token:
  const login = async (username, password) => {
    // Assuming you have an authentication API
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token); // Store token
        setUser({
          id: data.user._id,
          username: data.user.username,
          role: data.user.role,
          email: data.user.email
        });
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
    return false;
  };

  // Also update logout to clear token:
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};