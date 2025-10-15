import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/urbanwastex.png';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  // Navigation items
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    { 
      name: 'Waste Collection', 
      path: '/waste-collection', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ) 
    },
    { 
      name: 'Container Waste Level', 
      path: '/waste-level', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ) 
    },
    { 
      name: 'Payments & Rewards', 
      path: '/payments', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
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

export default Sidebar;