import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setUser(data.user);
      } catch {}
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="flex h-screen bg-green-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-md text-green-700 hover:bg-green-100 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-green-700 ml-2 md:ml-0">Waste Management System</h1>
              </div>
              
              {/* User profile */}
              <div className="flex items-center relative" ref={dropdownRef}>
                {user && (
                  <div className="text-right mr-3 hidden sm:block">
                    <div className="text-sm font-medium text-gray-800">Welcome back,</div>
                    <div className="text-xs text-green-600 font-semibold">{user.username}</div>
                  </div>
                )}
                <button
                  className="relative flex text-sm rounded-full focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 hover:scale-110"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <div className="h-10 w-10 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0 -right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                </button>
                {dropdownOpen && user && (
                  <div className="absolute right-0 top-full w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden mt-3 animate-in slide-in-from-top-2 duration-300">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 px-6 py-4 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{user.name || user.username}</h3>
                          <p className="text-green-100 text-sm">@{user.username}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Profile Information */}
                    <div className="px-6 py-5 space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                              <p className="text-sm font-medium text-gray-900 truncate" title={user.email}>{user.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Type</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;