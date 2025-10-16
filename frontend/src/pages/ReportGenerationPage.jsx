import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

const REPORT_TYPES = [
  'Waste Collection Summary',
  'Sensor Data',
  'Truck Activity',
  'Recycling Trends',
];

const PARAMETERS = [
    { label: 'Location', key: 'location', tooltip: 'Choose one or more locations.' },
    { label: 'Zone', key: 'zone', tooltip: 'Filter by collection zone.' },
    { label: 'Waste Type', key: 'wasteType', tooltip: 'Select types of waste to include.' },
    { label: 'Collection Method', key: 'collectionMethod', tooltip: 'Choose collection methods (manual, automated, etc).' },
  ];

const ReportGenerationPage = ({ onGenerate, initialParams }) => {
  const [reportType, setReportType] = useState(initialParams?.reportType || '');
  const [params, setParams] = useState(initialParams || {});
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    // No required validation for now
    setErrors({});
    return true;
  };

  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setShowResult(false);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
      // Prepare params based on report type
      const forwardedParams = { ...params };
      
      if (reportType === 'Waste Collection Summary') {
        // Ensure backend expects 'status' key (normalize collectionStatus -> status)
        if (forwardedParams.collectionStatus && !forwardedParams.status) {
          forwardedParams.status = forwardedParams.collectionStatus;
        }
      } else if (reportType === 'Sensor Data') {
        // For Sensor Data, use containerStatus as status
        if (forwardedParams.containerStatus && !forwardedParams.status) {
          forwardedParams.status = forwardedParams.containerStatus;
        }
      }
      
      onGenerate && onGenerate({ reportType, ...forwardedParams });
      // Pass all params to visualization page so it can call the API with filters
      navigate('/report-visualization', { state: { reportType, ...forwardedParams } });
    }, 1500);
  };
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [wasteTypeDropdownOpen, setWasteTypeDropdownOpen] = useState(false);
  const [collectionMethodDropdownOpen, setCollectionMethodDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-10 border-t-8 border-green-600">
        <h2 className="text-4xl font-bold text-green-700 mb-8 text-left">Generate Analytical Report</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-8 items-end">
            <div className="flex flex-col min-w-[220px] relative">
              <label className="text-green-700 font-semibold mb-2 text-lg">Report Type</label>
              <div className="relative">
                <button
                  type="button"
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.reportType ? 'border-red-400' : 'border-green-300'} bg-white text-left text-lg focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg flex items-center justify-between`}
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  <span>{reportType ? reportType : 'Select report type'}</span>
                  <svg className={`ml-2 h-5 w-5 text-green-600 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <ul
                  className={`absolute left-0 w-full mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-10 transition-all duration-300 ease-in-out ${dropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                  role="listbox"
                  tabIndex={-1}
                >
                  <li
                    className={`px-4 py-3 cursor-pointer text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-t-lg ${!reportType ? 'bg-green-50 text-green-700' : ''}`}
                    onClick={() => { setReportType(''); setDropdownOpen(false); }}
                  >Select report type</li>
                  {REPORT_TYPES.map((type) => (
                    <li
                      key={type}
                      className={`px-4 py-3 cursor-pointer hover:bg-green-100 hover:text-green-700 transition-all duration-200 ${reportType === type ? 'bg-green-200 text-green-700 font-bold' : 'text-gray-700'}`}
                      onClick={() => { setReportType(type); setDropdownOpen(false); }}
                    >{type}</li>
                  ))}
                </ul>
              </div>
              {errors.reportType && <span className="text-red-600 text-sm mt-1 block">{errors.reportType}</span>}
            </div>
            <div className="flex flex-col min-w-[220px]">
              <div className="flex items-center mb-2">
                <label className="text-green-700 font-semibold text-lg mr-2">Start Date</label>
                <span className="ml-1 cursor-pointer" data-tooltip-id="tip-start-date">🛈</span>
                <Tooltip id="tip-start-date" place="right" content="Select the start date for the report." />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={params.startDate || ''}
                  onChange={(e) => handleParamChange('startDate', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.startDate ? 'border-red-400' : 'border-green-300'} bg-white text-lg focus:outline-none focus:ring-4 focus:ring-green-400 focus:bg-green-50 focus:scale-105 hover:bg-green-100 hover:scale-105 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg cursor-pointer`}
                  style={{ WebkitAppearance: 'none', appearance: 'none' }}
                />
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.startDate && <span className="text-red-600 text-sm mt-1 block">{errors.startDate}</span>}
            </div>
            <div className="flex flex-col min-w-[220px]">
              <div className="flex items-center mb-2">
                <label className="text-green-700 font-semibold text-lg mr-2">End Date</label>
                <span className="ml-1 cursor-pointer" data-tooltip-id="tip-end-date">🛈</span>
                <Tooltip id="tip-end-date" place="right" content="Select the end date for the report." />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={params.endDate || ''}
                  onChange={(e) => handleParamChange('endDate', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.endDate ? 'border-red-400' : 'border-green-300'} bg-white text-lg focus:outline-none focus:ring-4 focus:ring-green-400 focus:bg-green-50 focus:scale-105 hover:bg-green-100 hover:scale-105 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg cursor-pointer`}
                  style={{ WebkitAppearance: 'none', appearance: 'none' }}
                />
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.endDate && <span className="text-red-600 text-sm mt-1 block">{errors.endDate}</span>}
            </div>
            {/* Conditional filter fields based on report type */}
            {reportType === 'Waste Collection Summary' && (
              <>
                {/* Location input */}
                <div className="flex flex-col min-w-[220px]">
                  <div className="flex items-center mb-2">
                    <label className="text-green-700 font-semibold text-lg mr-2">Location</label>
                    <span className="ml-1 cursor-pointer" data-tooltip-id="tip-location">🛈</span>
                    <Tooltip id="tip-location" place="right" content={PARAMETERS[0].tooltip} />
                  </div>
                  <input
                    type="text"
                    value={params.location || ''}
                    onChange={(e) => handleParamChange('location', e.target.value)}
                    placeholder="Enter location"
                    className={`px-4 py-3 rounded-lg border-2 ${errors.location ? 'border-red-400' : 'border-green-300'} bg-white focus:bg-green-50 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-lg transition-all duration-300 ease-in-out`}
                  />
                  {errors.location && <span className="text-red-600 text-sm mt-1 block">{errors.location}</span>}
                </div>
                {/* Waste Type custom dropdown */}
                <div className="flex flex-col min-w-[220px] relative">
                  <div className="flex items-center mb-2">
                    <label className="text-green-700 font-semibold text-lg mr-2">Waste Type</label>
                    <span className="ml-1 cursor-pointer" data-tooltip-id="tip-wasteType">🛈</span>
                    <Tooltip id="tip-wasteType" place="right" content={PARAMETERS[2].tooltip} />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${errors.wasteType ? 'border-red-400' : 'border-green-300'} bg-white text-left text-lg focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg flex items-center justify-between`}
                      onClick={() => setWasteTypeDropdownOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={wasteTypeDropdownOpen}
                    >
                      <span>{params.wasteType ? params.wasteType : 'Select waste type'}</span>
                      <svg className={`ml-2 h-5 w-5 text-green-600 transition-transform duration-300 ${wasteTypeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <ul
                      className={`absolute left-0 w-full mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-10 transition-all duration-300 ease-in-out ${wasteTypeDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                      role="listbox"
                      tabIndex={-1}
                    >
                      <li
                        className={`px-4 py-3 cursor-pointer text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-t-lg ${!params.wasteType ? 'bg-green-50 text-green-700' : ''}`}
                        onClick={() => { handleParamChange('wasteType', ''); setWasteTypeDropdownOpen(false); }}
                      >Select waste type</li>
                      {['Recyclables','General Waste','Compost','Hazardous'].map((type) => (
                        <li
                          key={type}
                          className={`px-4 py-3 cursor-pointer hover:bg-green-100 hover:text-green-700 transition-all duration-200 ${params.wasteType === type ? 'bg-green-200 text-green-700 font-bold' : 'text-gray-700'}`}
                          onClick={() => { handleParamChange('wasteType', type); setWasteTypeDropdownOpen(false); }}
                        >{type}</li>
                      ))}
                    </ul>
                  </div>
                  {errors.wasteType && <span className="text-red-600 text-sm mt-1 block">{errors.wasteType}</span>}
                </div>
                {/* Collection Status custom dropdown */}
                <div className="flex flex-col min-w-[220px] relative">
                  <div className="flex items-center mb-2">
                    <label className="text-green-700 font-semibold text-lg mr-2">Collection Status</label>
                    <span className="ml-1 cursor-pointer" data-tooltip-id="tip-collectionStatus">🛈</span>
                    <Tooltip id="tip-collectionStatus" place="right" content="Select the status of the collection." />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${errors.collectionStatus ? 'border-red-400' : 'border-green-300'} bg-white text-left text-lg focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg flex items-center justify-between`}
                      onClick={() => setCollectionMethodDropdownOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={collectionMethodDropdownOpen}
                    >
                      <span>{params.collectionStatus ? params.collectionStatus : 'Select collection status'}</span>
                      <svg className={`ml-2 h-5 w-5 text-green-600 transition-transform duration-300 ${collectionMethodDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <ul
                      className={`absolute left-0 w-full mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-10 transition-all duration-300 ease-in-out ${collectionMethodDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                      role="listbox"
                      tabIndex={-1}
                    >
                      <li
                        className={`px-4 py-3 cursor-pointer text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-t-lg ${!params.collectionStatus ? 'bg-green-50 text-green-700' : ''}`}
                        onClick={() => { handleParamChange('collectionStatus', ''); setCollectionMethodDropdownOpen(false); }}
                      >Select collection status</li>
                      {['Scheduled','In Progress','Completed','Cancelled','Pending'].map((type) => (
                        <li
                          key={type}
                          className={`px-4 py-3 cursor-pointer hover:bg-green-100 hover:text-green-700 transition-all duration-200 ${params.collectionStatus === type ? 'bg-green-200 text-green-700 font-bold' : 'text-gray-700'}`}
                          onClick={() => { handleParamChange('collectionStatus', type); setCollectionMethodDropdownOpen(false); }}
                        >{type}</li>
                      ))}
                    </ul>
                  </div>
                  {errors.collectionStatus && <span className="text-red-600 text-sm mt-1 block">{errors.collectionStatus}</span>}
                </div>
              </>
            )}

            {reportType === 'Sensor Data' && (
              <>
                {/* Container Type custom dropdown */}
                <div className="flex flex-col min-w-[220px] relative">
                  <div className="flex items-center mb-2">
                    <label className="text-green-700 font-semibold text-lg mr-2">Container Type</label>
                    <span className="ml-1 cursor-pointer" data-tooltip-id="tip-containerType">🛈</span>
                    <Tooltip id="tip-containerType" place="right" content="Select the type of container." />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${errors.containerType ? 'border-red-400' : 'border-green-300'} bg-white text-left text-lg focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg flex items-center justify-between`}
                      onClick={() => setWasteTypeDropdownOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={wasteTypeDropdownOpen}
                    >
                      <span>{params.containerType ? params.containerType : 'Select container type'}</span>
                      <svg className={`ml-2 h-5 w-5 text-green-600 transition-transform duration-300 ${wasteTypeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <ul
                      className={`absolute left-0 w-full mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-10 transition-all duration-300 ease-in-out ${wasteTypeDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                      role="listbox"
                      tabIndex={-1}
                    >
                      <li
                        className={`px-4 py-3 cursor-pointer text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-t-lg ${!params.containerType ? 'bg-green-50 text-green-700' : ''}`}
                        onClick={() => { handleParamChange('containerType', ''); setWasteTypeDropdownOpen(false); }}
                      >Select container type</li>
                      {['organic', 'polythene', 'plastic', 'glass', 'metal', 'paper', 'cardboard', 'mixed'].map((type) => (
                        <li
                          key={type}
                          className={`px-4 py-3 cursor-pointer hover:bg-green-100 hover:text-green-700 transition-all duration-200 ${params.containerType === type ? 'bg-green-200 text-green-700 font-bold' : 'text-gray-700'}`}
                          onClick={() => { handleParamChange('containerType', type); setWasteTypeDropdownOpen(false); }}
                        >{type}</li>
                      ))}
                    </ul>
                  </div>
                  {errors.containerType && <span className="text-red-600 text-sm mt-1 block">{errors.containerType}</span>}
                </div>
                {/* Container Status custom dropdown */}
                <div className="flex flex-col min-w-[220px] relative">
                  <div className="flex items-center mb-2">
                    <label className="text-green-700 font-semibold text-lg mr-2">Container Status</label>
                    <span className="ml-1 cursor-pointer" data-tooltip-id="tip-containerStatus">🛈</span>
                    <Tooltip id="tip-containerStatus" place="right" content="Select the status of the container." />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${errors.containerStatus ? 'border-red-400' : 'border-green-300'} bg-white text-left text-lg focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg flex items-center justify-between`}
                      onClick={() => setCollectionMethodDropdownOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={collectionMethodDropdownOpen}
                    >
                      <span>{params.containerStatus ? params.containerStatus : 'Select container status'}</span>
                      <svg className={`ml-2 h-5 w-5 text-green-600 transition-transform duration-300 ${collectionMethodDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <ul
                      className={`absolute left-0 w-full mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-10 transition-all duration-300 ease-in-out ${collectionMethodDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                      role="listbox"
                      tabIndex={-1}
                    >
                      <li
                        className={`px-4 py-3 cursor-pointer text-gray-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-t-lg ${!params.containerStatus ? 'bg-green-50 text-green-700' : ''}`}
                        onClick={() => { handleParamChange('containerStatus', ''); setCollectionMethodDropdownOpen(false); }}
                      >Select container status</li>
                      {['Available', 'Full', 'Needs Maintenance', 'Out of Service'].map((type) => (
                        <li
                          key={type}
                          className={`px-4 py-3 cursor-pointer hover:bg-green-100 hover:text-green-700 transition-all duration-200 ${params.containerStatus === type ? 'bg-green-200 text-green-700 font-bold' : 'text-gray-700'}`}
                          onClick={() => { handleParamChange('containerStatus', type); setCollectionMethodDropdownOpen(false); }}
                        >{type}</li>
                      ))}
                    </ul>
                  </div>
                  {errors.containerStatus && <span className="text-red-600 text-sm mt-1 block">{errors.containerStatus}</span>}
                </div>
                {/* City input */}
                <div className="flex flex-col min-w-[220px]">
                  <div className="flex items-center mb-2">
                    <label className="text-green-700 font-semibold text-lg mr-2">City</label>
                    <span className="ml-1 cursor-pointer" data-tooltip-id="tip-city">🛈</span>
                    <Tooltip id="tip-city" place="right" content="Enter the city name to filter containers." />
                  </div>
                  <input
                    type="text"
                    value={params.city || ''}
                    onChange={(e) => handleParamChange('city', e.target.value)}
                    placeholder="Enter city"
                    className={`px-4 py-3 rounded-lg border-2 ${errors.city ? 'border-red-400' : 'border-green-300'} bg-white focus:bg-green-50 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-lg transition-all duration-300 ease-in-out`}
                  />
                  {errors.city && <span className="text-red-600 text-sm mt-1 block">{errors.city}</span>}
                </div>
              </>
            )}
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
