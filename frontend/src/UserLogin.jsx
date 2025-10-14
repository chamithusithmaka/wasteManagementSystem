import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy validation for demonstration
    if (username === '' || password === '') {
      setError('Please enter both username and password.');
      return;
    }
    // TODO: Replace with real authentication logic
    setError('');
    // On success, redirect to dashboard or home
    // navigate('/dashboard');
    alert('Login successful!');
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-green-400 to-green-200 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] opacity-30 z-0 bg-cover bg-center" />
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
        <h2 className="text-3xl font-extrabold text-green-700 mb-6 text-center drop-shadow">Waste Management System</h2>
        <form onSubmit={handleLogin} className="space-y-5">
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
      </div>
    </div>
  );
};

export default UserLogin;
