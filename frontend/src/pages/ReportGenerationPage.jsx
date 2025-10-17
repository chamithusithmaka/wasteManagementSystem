import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

// Constants
const REPORT_TYPES = [
  'Waste Collection Summary',
  'Sensor Data',
];

const WASTE_TYPES = ['Recyclables', 'General Waste', 'Compost', 'Hazardous'];
const COLLECTION_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Pending'];
const SENSOR_CONTAINER_TYPES = ['organic', 'polythene', 'plastic', 'glass', 'metal', 'paper', 'cardboard', 'mixed'];
const SENSOR_CONTAINER_STATUSES = ['Available', 'Full', 'Needs Maintenance', 'Out of Service'];
const PROVINCES = [
  'Western Province', 'Central Province', 'Southern Province', 'Northern Province', 'Eastern Province',
  'North Western Province', 'North Central Province', 'Uva Province', 'Sabaragamuwa Province'
];

// Reusable Dropdown Component
const Dropdown = ({
  label, value, options, onChange, error, tooltipId, tooltipContent, placeholder = 'Select', isOpen, setIsOpen
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  return (
    <div className="flex flex-col min-w-[220px] relative" ref={dropdownRef}>
      <div className="flex items-center mb-2">
        <label className="text-green-700 font-semibold text-lg mr-2">{label}</label>
        {tooltipId && (
          <>
            <span className="ml-1 cursor-pointer" data-tooltip-id={tooltipId}>🛈</span>
            <Tooltip id={tooltipId} place="right" content={tooltipContent} />
          </>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          className={`w-full px-4 py-3 rounded-lg border-2 ${error ? 'border-red-400' : 'border-green-300'} bg-white text-left text-lg focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg flex items-center justify-between`}
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{value ? value : placeholder}</span>
          <svg className={`ml-2 h-5 w-5 text-green-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ul
          className={`absolute left-0 w-full mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-10 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
          role="listbox"
          tabIndex={-1}
        >
          <li
            className={`px-4 py-3 cursor-pointer text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-t-lg ${!value ? 'bg-green-50 text-green-700' : ''}`}
            onClick={() => { onChange(''); setIsOpen(false); }}
          >{placeholder}</li>
          {options.map((opt) => (
            <li
              key={opt}
              className={`px-4 py-3 cursor-pointer hover:bg-green-100 hover:text-green-700 transition-all duration-200 ${value === opt ? 'bg-green-200 text-green-700 font-bold' : 'text-gray-700'}`}
              onClick={() => { onChange(opt); setIsOpen(false); }}
            >{opt}</li>
          ))}
        </ul>
      </div>
      {error && <span className="text-red-600 text-sm mt-1 block">{error}</span>}
    </div>
  );
};

// Reusable Date Input
const DateInput = ({ label, value, onChange, error, tooltipId, tooltipContent }) => (
  <div className="flex flex-col min-w-[220px]">
    <div className="flex items-center mb-2">
      <label className="text-green-700 font-semibold text-lg mr-2">{label} <span className="text-red-500">*</span></label>
      {tooltipId && (
        <>
          <span className="ml-1 cursor-pointer" data-tooltip-id={tooltipId}>🛈</span>
          <Tooltip id={tooltipId} place="right" content={tooltipContent} />
        </>
      )}
    </div>
    <div className="relative">
      <input
        type="date"
        value={value || ''}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg border-2 ${error ? 'border-red-400' : 'border-green-300'} bg-white text-lg focus:outline-none focus:ring-4 focus:ring-green-400 focus:bg-green-50 focus:scale-105 hover:bg-green-100 hover:scale-105 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg cursor-pointer`}
        style={{ WebkitAppearance: 'none', appearance: 'none' }}
      />
      <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
      </svg>
    </div>
    {error && <span className="text-red-600 text-sm mt-1 block">{error}</span>}
  </div>
);

const ReportGenerationPage = ({ onGenerate, initialParams }) => {
  const [reportType, setReportType] = useState(initialParams?.reportType || '');
  const [params, setParams] = useState(initialParams || {});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    reportType: false,
    wasteType: false,
    collectionStatus: false,
    province: false,
    containerType: false,
    containerStatus: false,
    provinceSensor: false,
  });
  const navigate = useNavigate();

  // Dropdown open/close handlers
  const setDropdownOpen = (key, open) => setDropdowns((prev) => ({ ...prev, [key]: open }));

  // Param change handler
  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!reportType || reportType.trim() === '') newErrors.reportType = 'Report type is required';
    if (!params.startDate || params.startDate.trim() === '') newErrors.startDate = 'Start date is required';
    if (!params.endDate || params.endDate.trim() === '') newErrors.endDate = 'End date is required';
    if (params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);
      if (endDate < startDate) newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setShowResult(false);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
      const forwardedParams = { ...params };
      if (reportType === 'Waste Collection Summary') {
        if (forwardedParams.collectionStatus && !forwardedParams.status) {
          forwardedParams.status = forwardedParams.collectionStatus;
        }
      } else if (reportType === 'Sensor Data') {
        if (forwardedParams.containerStatus && !forwardedParams.status) {
          forwardedParams.status = forwardedParams.containerStatus;
        }
      }
      onGenerate && onGenerate({ reportType, ...forwardedParams });
      navigate('/report-visualization', { state: { reportType, ...forwardedParams } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-10 border-t-8 border-green-600">
        <h2 className="text-4xl font-bold text-green-700 mb-8 text-left">Generate Analytical Report</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-8 items-end">
            {/* Report Type Dropdown */}
            <Dropdown
              label="Report Type *"
              value={reportType}
              options={REPORT_TYPES}
              onChange={(val) => { setReportType(val); setDropdownOpen('reportType', false); }}
              error={errors.reportType}
              isOpen={dropdowns.reportType}
              setIsOpen={(open) => setDropdownOpen('reportType', open)}
              placeholder="Select report type"
            />
            {/* Start Date */}
            <DateInput
              label="Start Date"
              value={params.startDate}
              onChange={(e) => handleParamChange('startDate', e.target.value)}
              error={errors.startDate}
              tooltipId="tip-start-date"
              tooltipContent="Select the start date for the report."
            />
            {/* End Date */}
            <DateInput
              label="End Date"
              value={params.endDate}
              onChange={(e) => handleParamChange('endDate', e.target.value)}
              error={errors.endDate}
              tooltipId="tip-end-date"
              tooltipContent="Select the end date for the report."
            />

            {/* Waste Collection Summary Filters */}
            {reportType === 'Waste Collection Summary' && (
              <>
                <Dropdown
                  label="Waste Type"
                  value={params.wasteType}
                  options={WASTE_TYPES}
                  onChange={(val) => handleParamChange('wasteType', val)}
                  error={errors.wasteType}
                  isOpen={dropdowns.wasteType}
                  setIsOpen={(open) => setDropdownOpen('wasteType', open)}
                  tooltipId="tip-wasteType"
                  tooltipContent="Select types of waste to include."
                  placeholder="Select waste type"
                />
                <Dropdown
                  label="Collection Status"
                  value={params.collectionStatus}
                  options={COLLECTION_STATUSES}
                  onChange={(val) => handleParamChange('collectionStatus', val)}
                  error={errors.collectionStatus}
                  isOpen={dropdowns.collectionStatus}
                  setIsOpen={(open) => setDropdownOpen('collectionStatus', open)}
                  tooltipId="tip-collectionStatus"
                  tooltipContent="Select the status of the collection."
                  placeholder="Select collection status"
                />
                <Dropdown
                  label="Province"
                  value={params.province}
                  options={[
                    'Western', 'Central', 'Southern', 'Northern', 'Eastern',
                    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
                  ]}
                  onChange={(val) => handleParamChange('province', val)}
                  error={errors.province}
                  isOpen={dropdowns.province}
                  setIsOpen={(open) => setDropdownOpen('province', open)}
                  tooltipId="tip-province"
                  tooltipContent="Select a province in Sri Lanka."
                  placeholder="Select province"
                />
              </>
            )}

            {/* Sensor Data Filters */}
            {reportType === 'Sensor Data' && (
              <>
                <Dropdown
                  label="Container Type"
                  value={params.containerType}
                  options={SENSOR_CONTAINER_TYPES}
                  onChange={(val) => handleParamChange('containerType', val)}
                  error={errors.containerType}
                  isOpen={dropdowns.containerType}
                  setIsOpen={(open) => setDropdownOpen('containerType', open)}
                  tooltipId="tip-containerType"
                  tooltipContent="Select the type of container."
                  placeholder="Select container type"
                />
                <Dropdown
                  label="Container Status"
                  value={params.containerStatus}
                  options={SENSOR_CONTAINER_STATUSES}
                  onChange={(val) => handleParamChange('containerStatus', val)}
                  error={errors.containerStatus}
                  isOpen={dropdowns.containerStatus}
                  setIsOpen={(open) => setDropdownOpen('containerStatus', open)}
                  tooltipId="tip-containerStatus"
                  tooltipContent="Select the status of the container."
                  placeholder="Select container status"
                />
                <Dropdown
                  label="Province"
                  value={params.province}
                  options={PROVINCES}
                  onChange={(val) => handleParamChange('province', val)}
                  error={errors.province}
                  isOpen={dropdowns.provinceSensor}
                  setIsOpen={(open) => setDropdownOpen('provinceSensor', open)}
                  tooltipId="tip-province-sensor"
                  tooltipContent="Select a province in Sri Lanka."
                  placeholder="Select province"
                />
              </>
            )}

            {/* Submit Button */}
            <div className="flex flex-col justify-end min-w-[220px]">
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white font-bold text-xl shadow-md hover:scale-105 hover:shadow-xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 ease-in-out flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-6 w-6 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating...
                  </span>
                ) : 'Generate Report'}
              </button>
            </div>
          </div>
        </form>
        {/* Animated result card */}
        <div className={`transition-all duration-500 ease-in-out ${showResult ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} mt-10`}>
          {showResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-8 flex flex-col items-center">
              <svg className="h-12 w-12 text-green-600 mb-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              <h3 className="text-2xl font-bold text-green-700 mb-2">Report Ready!</h3>
              <p className="text-green-700 text-lg">Your analytical report has been generated. You can now view or export the results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerationPage;
