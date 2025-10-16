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
                  <span className="text-sm text-gray-700 mr-2">{user.username}</span>
                )}
                <button
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-green-500 transition duration-150 ease-in-out bg-green-100 p-1"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {dropdownOpen && user && (
                  <div className="absolute right-0 top-full w-56 bg-white rounded-xl shadow-lg border border-green-100 z-50 p-4 text-left">
                    <div className="font-bold text-green-700 text-lg mb-2">Profile</div>
                    <div className="mb-1"><span className="font-semibold">Username:</span> {user.username}</div>
                    <div className="mb-1"><span className="font-semibold">Name:</span> {user.name}</div>
                    <div className="mb-1"><span className="font-semibold">Email:</span> {user.email}</div>
                    <div className="mb-1"><span className="font-semibold">Role:</span> {user.role}</div>
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