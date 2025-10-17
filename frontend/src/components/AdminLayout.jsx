import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from '../pages/admin/AdminDashboard';
import WasteCollectionManagement from '../pages/admin/WasteCollectionManagement';
import WasteCollectionDetails from '../pages/admin/WasteCollectionDetails';
import ContainerManagement from '../pages/admin/ContainerManagement';
import ContainerDetails from '../pages/admin/ContainerDetails';
import ReportGenerationPage from '../pages/admin/ReportGenerationPage';
import ReportVisualizationPage from '../pages/admin/ReportVisualizationPage';
import Profile from '../pages/admin/Profile';

const AdminLayout = ({ children }) => {
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
        console.log('AdminLayout profile fetch:', data); // Debug log
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          console.error('Failed to fetch profile in AdminLayout:', data);
        }
      } catch (error) {
        console.error('Error fetching profile in AdminLayout:', error);
      }
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
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Top Navigation */}
        <header className="bg-white shadow-lg border-b border-green-200 z-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-lg text-green-600 hover:bg-green-100 focus:outline-none transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="ml-2 md:ml-0">
                  <h1 className="text-xl font-bold text-green-800">Admin Dashboard</h1>
                  <p className="text-sm text-green-600">Management Control Center</p>
                </div>
              </div>
              {/* Admin profile */}
              <div className="flex items-center relative" ref={dropdownRef}>
                {user && (
                  <div className="text-right mr-3 hidden sm:block">
                    <div className="text-sm font-medium text-green-800">{user.username}</div>
                    <div className="text-xs text-green-600">Administrator</div>
                  </div>
                )}
                <button
                  className="flex text-sm border-2 border-transparent rounded-xl focus:outline-none focus:border-green-500 transition duration-150 ease-in-out bg-gradient-to-r from-green-500 to-green-600 p-2 shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {dropdownOpen && user && (
                  <div className="absolute right-0 top-full w-64 bg-white rounded-xl shadow-2xl border border-green-200 z-50 p-5 text-left mt-2">
                    <div className="flex items-center mb-4 pb-3 border-b border-green-200">
                      <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <div className="font-bold text-green-800 text-lg">Admin Profile</div>
                        <div className="text-xs text-green-600">System Administrator</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-green-700">Username:</span> 
                        <span className="text-green-900">{user.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-green-700">Name:</span> 
                        <span className="text-green-900">{user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-green-700">Email:</span> 
                        <span className="text-green-900 truncate max-w-xs" title={user.email}>{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-green-700">Role:</span> 
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{user.role}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-green-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
