import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WasteCollectionService from '../../services/wasteCollectionService';

const defaultForm = {
  address: '',
  province: '',
  wasteType: 'Recyclables',
  date: '',
  time: '',
  notes: '',
  containerFillLevel: 50
};

// Sri Lanka provinces for dropdown
const provinces = [
  'Central',
  'Eastern',
  'North Central',
  'Northern',
  'North Western',
  'Sabaragamuwa',
  'Southern',
  'Uva',
  'Western'
];

const SchedulePickup = () => {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.address || !form.province || !form.date || !form.time) {
      setError('Please fill address, province, date and time.');
      return false;
    }
    
    // Validate date is in the future
    const pickupDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (pickupDate < today) {
      setError('Pickup date cannot be in the past.');
      return false;
    }
    
    setError('');
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      // Map form data to backend format
      const pickupData = {
        address: form.address,
        province: form.province,
        wasteType: form.wasteType,
        scheduledDate: form.date,
        scheduledTime: form.time,
        notes: form.notes,
        containerFillLevel: parseInt(form.containerFillLevel || 50)
      };

      // Call API to schedule pickup
      await WasteCollectionService.schedulePickup(pickupData);
      
      setSuccess(true);
      setSubmitting(false);

      // Show success briefly then navigate back to waste-collection
      setTimeout(() => {
        navigate('/waste-collection');
      }, 900);
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to schedule. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="bg-white rounded-2xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">Schedule New Pickup</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Fill out the details below to arrange your waste collection.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 font-medium">Pickup Address</label>
            <input 
              required 
              value={form.address} 
              onChange={(e) => update('address', e.target.value)} 
              className="w-full px-4 py-3 rounded-lg border border-green-100 bg-green-50 focus:ring-2 focus:ring-green-200 transition" 
              placeholder="123 EcoLane, GreenCity" 
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium">Province</label>
            <select 
              required
              value={form.province} 
              onChange={(e) => update('province', e.target.value)} 
              className="w-full px-4 py-3 rounded-lg border border-green-100 bg-green-50 focus:ring-2 focus:ring-green-200 transition"
            >
              <option value="">Select Province</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium">Waste Type</label>
            <select 
              value={form.wasteType} 
              onChange={(e) => update('wasteType', e.target.value)} 
              className="w-full px-4 py-3 rounded-lg border border-green-100 bg-green-50 focus:ring-2 focus:ring-green-200 transition"
            >
              <option>Recyclables</option>
              <option>General Waste</option>
              <option>Compost</option>
              <option>Hazardous</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700 font-medium">Collection Date</label>
              <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-green-100 bg-green-50 focus:ring-2 focus:ring-green-200 transition" />
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">Collection Time</label>
              <input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-green-100 bg-green-50 focus:ring-2 focus:ring-green-200 transition" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium">Container Fill Level</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={form.containerFillLevel || 50} 
                onChange={(e) => update('containerFillLevel', e.target.value)} 
                className="flex-1 accent-green-700" 
              />
              <span className="text-sm text-gray-700 w-16">{form.containerFillLevel || 50}%</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg border border-green-100 bg-green-50 focus:ring-2 focus:ring-green-200 transition" placeholder="Please collect from side entrance." />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-green-700 text-white font-semibold flex items-center justify-center gap-3 transform transition hover:scale-[1.01] disabled:opacity-60"
            >
              {!submitting && !success && <span className="inline-flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" stroke="white" strokeLinecap="round" strokeLinejoin="round"></path></svg> Request Pickup</span>}
              {submitting && (
                <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {success && !submitting && (
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchedulePickup;