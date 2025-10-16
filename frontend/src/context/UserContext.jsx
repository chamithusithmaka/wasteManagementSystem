import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(undefined);

const HARDCODED_USERS = [
  { id: 'u1', username: 'user1', password: 'pass1', role: 'user', email: 'sithma2002@gmail.com' },
  { id: 'a1', username: 'admin', password: 'adminpass', role: 'admin', email: 'sithma2002@gmail.com' }
];

export const UserProvider = ({ children }) => {
  // Set the default user to the first hardcoded user
  const [user, setUser] = useState(HARDCODED_USERS[0]);

  const login = (username, password, isAdmin = false) => {
    const found = HARDCODED_USERS.find(
      u => u.username === username && u.password === password && (isAdmin ? u.role === 'admin' : u.role === 'user')
    );
    if (found) {
      setUser({ id: found.id, username: found.username, role: found.role, email: found.email });
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