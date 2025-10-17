import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/urbanwastex.png';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate to login page
    navigate('/');
  };
  // Only admin options
  const navItems = [
    {
      name: 'Admin Dashboard',
      path: '/admin-dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      name: 'Container Management',
      path: '/container-dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      )
    },
    { name: 'Waste Collection', path: '/admin/waste-collection', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 12a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H10z" clipRule="evenodd" />
      </svg>
    ) },
    {
      name: 'Generate Reports',
      path: '/report-generation',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17 8h2a1 1 0 011 1v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1h2V5a3 3 0 013-3h2a3 3 0 013 3v3zM7 5a1 1 0 011-1h2a1 1 0 011 1v3H7V5z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
      {/* Sidebar */}
      <div className="relative flex flex-col h-full bg-green-900 shadow-2xl w-64 z-30 border-r border-green-700">
        {/* Logo */}
        <div className="h-16 px-3 flex items-center justify-between bg-gradient-to-r from-green-800 to-green-700 border-b border-green-600">
          <div className="flex items-center">
            <img src={logo} alt="UrbanWasteX logo" className="h-10 w-10 object-contain" />
            <div className="ml-2 flex flex-col">
              <span className="text-lg font-bold text-white">UrbanWasteX</span>
              <span className="text-xs text-green-300 font-medium">Admin Panel</span>
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-white hover:bg-green-600 transition-colors md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Navigation */}
        <div className="flex-grow py-6 px-3 overflow-y-auto bg-green-900">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-green-300 rounded-xl hover:bg-green-800 hover:text-white transition-all duration-200 group relative ${
                    location.pathname === item.path ? 'bg-green-600 text-white font-medium shadow-lg' : ''
                  }`}
                >
                  <span className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition-colors ${
                    location.pathname === item.path 
                      ? 'text-green-100 bg-green-500' 
                      : 'text-green-400 bg-green-800 group-hover:bg-green-700 group-hover:text-green-200'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="ml-3 font-medium">{item.name}</span>
                  {location.pathname === item.path && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-300 rounded-r"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Bottom section */}
        <div className="p-4 border-t border-green-700 bg-green-900">
          <button
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl transition-all duration-200 font-medium"
            onClick={handleLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 12a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H10z" clipRule="evenodd" />
            </svg>
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
