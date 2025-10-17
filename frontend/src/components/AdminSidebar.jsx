import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/urbanwastex.png';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
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
    {
      name: 'Generate Reports',
      path: '/report-generation',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17 8h2a1 1 0 011 1v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1h2V5a3 3 0 013-3h2a3 3 0 013 3v3zM7 5a1 1 0 011-1h2a1 1 0 011 1v3H7V5z" />
        </svg>
      )
    },
    { name: 'Waste Collection', path: '/admin/waste-collection', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 12a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H10z" clipRule="evenodd" />
      </svg>
    ) }
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
      <div className="relative flex flex-col h-full bg-white shadow-xl w-64 z-30">
        {/* Logo */}
        <div className="h-16 px-3 flex items-center justify-between bg-gradient-to-r from-green-700 to-green-500">
          <div className="flex items-center">
            <img src={logo} alt="UrbanWasteX logo" className="h-10 w-10 object-contain" />
            <span className="ml-2 text-xl font-bold text-white">UrbanWasteX</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-white hover:bg-green-600 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Navigation */}
        <div className="flex-grow py-4 px-2 overflow-y-auto bg-green-50">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors group ${
                    location.pathname === item.path ? 'bg-green-200 text-green-800 font-medium' : ''
                  }`}
                >
                  <span className="inline-flex items-center justify-center h-10 w-10 text-green-700 bg-green-100 group-hover:bg-green-200 rounded-lg">
                    {item.icon}
                  </span>
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Bottom section */}
        <div className="p-4 border-t border-green-200 bg-green-50">
          <button
            className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            onClick={() => {/* Handle logout */}}
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
