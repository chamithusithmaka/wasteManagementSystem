import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(undefined);

const HARDCODED_USERS = [
  { username: 'user1', password: 'pass1', role: 'user' },
  { username: 'admin', password: 'adminpass', role: 'admin' }
];

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (username, password, isAdmin = false) => {
    const found = HARDCODED_USERS.find(
      u => u.username === username && u.password === password && (isAdmin ? u.role === 'admin' : u.role === 'user')
    );
    if (found) {
      setUser({ username: found.username, role: found.role });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

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