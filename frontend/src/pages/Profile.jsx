import React, { useState, useEffect } from 'react';
import UserService from '../services/userService';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    role: '',
    address: '',
    province: '',
    phone: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }
      
      const data = await UserService.getProfile(token);
      if (data.user) {
        setUser(data.user);
        setFormData(data.user);
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      setError('Error loading profile. Please try again later.');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Here you would make an API call to update the profile
      // For now we'll simulate success
      setTimeout(() => {
        setUser(formData);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setLoading(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 800);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setFormData(user); // Reset form data to current user data if canceling
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccessMessage('');
  };

  if (loading && !user.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">My Profile</h1>
        <button
          onClick={toggleEdit}
          className={`px-4 py-2 rounded-lg ${
            isEditing 
              ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          } transition-colors flex items-center gap-2`}
        >
          {isEditing ? (
            <>
              <span className="text-lg">✖</span> Cancel
            </>
          ) : (
            <>
              <span className="text-lg">✏️</span> Edit Profile
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-green-50 p-6 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center text-5xl font-bold text-green-700 mb-4">
              {user.name ? user.name.charAt(0).toUpperCase() : ''}
            </div>
            <h2 className="text-xl font-semibold text-center">{user.username || 'Username'}</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mt-2">
              {user.role === 'admin' ? 'Administrator' : 'User'}
            </span>
            
            <div className="mt-8 w-full">
              <h3 className="text-lg font-semibold text-green-700 mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-gray-600">Pickups</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-gray-600">Waste Recycled</span>
                  <span className="font-semibold">68 kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-gray-600">Eco Points</span>
                  <span className="font-semibold text-green-600">240</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            <h3 className="text-xl font-semibold text-green-700 mb-4">Personal Information</h3>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select
                      name="province"
                      value={formData.province || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none"
                    >
                      <option value="">Select Province</option>
                      <option value="Western">Western</option>
                      <option value="Central">Central</option>
                      <option value="Southern">Southern</option>
                      <option value="Northern">Northern</option>
                      <option value="Eastern">Eastern</option>
                      <option value="North Western">North Western</option>
                      <option value="North Central">North Central</option>
                      <option value="Uva">Uva</option>
                      <option value="Sabaragamuwa">Sabaragamuwa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-green-200 bg-green-50 focus:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></span>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField label="Full Name" value={user.name} />
                  <InfoField label="Email" value={user.email} />
                  <InfoField label="Phone" value={user.phone || 'Not provided'} />
                  <InfoField label="Province" value={user.province || 'Not provided'} />
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <InfoField label="Address" value={user.address || 'Not provided'} />
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 mt-8 pt-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <ActivityItem 
                  date="Oct 15, 2025"
                  title="Waste Pickup Scheduled"
                  description="Recyclables collection"
                  status="Scheduled"
                />
                <ActivityItem 
                  date="Oct 10, 2025"
                  title="Waste Collection Completed"
                  description="15kg of general waste collected"
                  status="Completed"
                />
                <ActivityItem 
                  date="Oct 3, 2025"
                  title="Profile Updated"
                  description="You updated your contact information"
                  status="Info"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 border-t border-green-100">
          <h3 className="text-lg font-semibold text-green-700 mb-3">Environmental Impact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ImpactCard 
              icon="🌳"
              title="Trees Saved"
              value="3"
              description="Through your recycling efforts"
            />
            <ImpactCard 
              icon="💧" 
              title="Water Conserved"
              value="240L"
              description="Through waste reduction"
            />
            <ImpactCard 
              icon="🌎" 
              title="CO₂ Reduced"
              value="18kg"
              description="Carbon footprint reduction"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Information field component
const InfoField = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-lg font-medium text-gray-800">{value}</p>
  </div>
);

// Activity item component
const ActivityItem = ({ date, title, description, status }) => {
  const statusStyles = {
    Scheduled: 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Info: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="text-right">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
          {status}
        </span>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
    </div>
  );
};

// Impact card component
const ImpactCard = ({ icon, title, value, description }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm flex items-center">
    <div className="text-3xl mr-3">{icon}</div>
    <div>
      <div className="flex items-baseline">
        <span className="text-xl font-bold text-green-700">{value}</span>
        <span className="ml-1 text-sm text-gray-500">{title}</span>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
);

export default Profile;