import React, { useState, useEffect } from 'react';
import { AlertBanner } from '../../components/admin';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  // Fetch profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          contactNumber: data.user.contactNumber || '',
          password: '',
          confirmPassword: ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError(null);
    
    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      setUpdateError('Passwords do not match');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Only include password if it's provided
      const dataToUpdate = {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber
      };
      
      if (formData.password) {
        dataToUpdate.password = formData.password;
      }
      
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToUpdate)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const data = await response.json();
      setProfile(data.user);
      setUpdateSuccess(true);
      
      // Clear passwords
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError(err.message || 'Failed to update profile');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <AlertBanner title="Error" type="error">
          {error}
        </AlertBanner>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Admin Profile</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-800">{profile.username}</h2>
              <p className="text-sm text-gray-500">{profile.role}</p>
              
              <div className="mt-6 w-full">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Account Details</h3>
                <div className="text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Username:</span>
                    <span className="font-medium">{profile.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Role:</span>
                    <span className="font-medium">{profile.role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Member Since:</span>
                    <span className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Last Login:</span>
                    <span className="font-medium">{new Date(profile.lastLogin || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Edit Profile</h2>
            
            {updateSuccess && (
              <AlertBanner title="Success" type="success" className="mb-4">
                Your profile has been updated successfully.
              </AlertBanner>
            )}
            
            {updateError && (
              <AlertBanner title="Error" type="error" className="mb-4">
                {updateError}
              </AlertBanner>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your full name"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your email address"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your contact number"
                />
              </div>
              
              <hr className="my-6" />
              
              <h3 className="text-md font-semibold text-gray-700 mb-4">Change Password</h3>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;