import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from './services/userService';

const UserLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    try {
      const data = await UserService.login(username, password);
      if (!data.token || !data.user) {
        setError(data.message || 'Login failed.');
        return;
      }
      localStorage.setItem('token', data.token);
      if (data.user.role === 'user') {
        navigate('/dashboard');
      } else {
        setError('Account is not registered as a user.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (adminUsername === '' || adminPassword === '') {
      setAdminError('Please enter both admin username and password.');
      return;
    }
    setAdminError('');
    try {
      const data = await UserService.login(adminUsername, adminPassword);
      if (!data.token || !data.user) {
        setAdminError(data.message || 'Login failed.');
        return;
      }
      localStorage.setItem('token', data.token);
      if (data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        setAdminError('Not an admin account.');
      }
    } catch (err) {
      setAdminError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-green-400 to-green-200 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] opacity-30 z-0 bg-cover bg-center" />
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
        {!isAdmin ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-4xl font-extrabold text-green-700 text-center">Login</h2>
              <button
                type="button"
                className="px-4 py-1 rounded-lg bg-green-100 text-green-700 font-semibold text-sm shadow hover:bg-green-200 transition"
                onClick={() => setIsAdmin(true)}
              >
                Admin Login
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-5 mt-4">
              <div>
                <label htmlFor="username" className="block text-green-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none text-lg transition shadow-sm placeholder-green-300"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-green-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none text-lg transition shadow-sm placeholder-green-300"
                />
              </div>
              {error && <div className="text-red-600 font-semibold text-base text-left mb-2">{error}</div>}
              <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-green-700 to-green-400 text-white font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-500 transition">Login</button>
            </form>
            <div className="mt-6 text-center text-green-700 font-medium">
              Don't have an account?{' '}
              <span onClick={() => navigate('/signup')} className="underline cursor-pointer font-bold hover:text-green-900 transition">Sign up</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-4xl font-extrabold text-green-700 text-center">Admin Login</h2>
              <button
                type="button"
                className="px-4 py-1 rounded-lg bg-green-100 text-green-700 font-semibold text-sm shadow hover:bg-green-200 transition"
                onClick={() => setIsAdmin(false)}
              >
                Back
              </button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-5 mt-4">
              <div>
                <label htmlFor="adminUsername" className="block text-green-700 font-semibold mb-2">Admin Username</label>
                <input
                  type="text"
                  id="adminUsername"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none text-lg transition shadow-sm placeholder-green-300"
                />
              </div>
              <div>
                <label htmlFor="adminPassword" className="block text-green-700 font-semibold mb-2">Admin Password</label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none text-lg transition shadow-sm placeholder-green-300"
                />
              </div>
              {adminError && <div className="text-red-600 font-semibold text-base text-left mb-2">{adminError}</div>}
              <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-green-700 to-green-400 text-white font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-500 transition">Admin Login</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
