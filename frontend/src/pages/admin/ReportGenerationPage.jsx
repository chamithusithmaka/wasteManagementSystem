import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertBanner } from '../../components/admin';

const ReportGenerationPage = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('wasteCollection');
  const [dateRange, setDateRange] = useState({
    startDate: getLastMonthDate(),
    endDate: getTodayDate()
  });
  const [filters, setFilters] = useState({
    province: '',
    wasteType: '',
    status: ''
  });
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, this would make an API call to generate the report
      // For this demo, we'll simulate a successful report generation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to report visualization page with query parameters
      navigate('/admin/reports/view', { 
        state: {
          reportType,
          dateRange,
          filters,
          format,
          includeCharts
        }
      });
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Predefined date ranges
  const setDateRangePreset = (preset) => {
    switch (preset) {
      case 'today':
        setDateRange({
          startDate: getTodayDate(),
          endDate: getTodayDate()
        });
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayFormatted = formatDateForInput(yesterday);
        setDateRange({
          startDate: yesterdayFormatted,
          endDate: yesterdayFormatted
        });
        break;
      case 'thisWeek':
        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        setDateRange({
          startDate: formatDateForInput(thisWeekStart),
          endDate: getTodayDate()
        });
        break;
      case 'thisMonth':
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        setDateRange({
          startDate: formatDateForInput(thisMonthStart),
          endDate: getTodayDate()
        });
        break;
      case 'lastMonth':
        setDateRange({
          startDate: getLastMonthDate(),
          endDate: getTodayDate()
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Generate Reports</h1>
      
      {error && (
        <AlertBanner title="Error" type="error" className="mb-6">
          {error}
        </AlertBanner>
      )}
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Type Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ReportTypeCard
                  type="wasteCollection"
                  title="Waste Collection Report"
                  icon="📊"
                  description="Overview of waste collection activities, schedules, and completion rates."
                  selected={reportType === 'wasteCollection'}
                  onClick={() => setReportType('wasteCollection')}
                />
                <ReportTypeCard
                  type="containerStatus"
                  title="Container Status Report"
                  icon="🗑️"
                  description="Analysis of container usage, fill levels, and maintenance needs."
                  selected={reportType === 'containerStatus'}
                  onClick={() => setReportType('containerStatus')}
                />
                <ReportTypeCard
                  type="wasteAnalytics"
                  title="Waste Analytics"
                  icon="📈"
                  description="Detailed breakdown of waste types, volumes, and recycling metrics."
                  selected={reportType === 'wasteAnalytics'}
                  onClick={() => setReportType('wasteAnalytics')}
                />
              </div>
            </div>
            
            {/* Date Range Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setDateRangePreset('today')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateRangePreset('yesterday')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setDateRangePreset('thisWeek')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setDateRangePreset('thisMonth')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => setDateRangePreset('lastMonth')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Last Month
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    min={dateRange.startDate}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filters
              </label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="province" className="block text-xs font-medium text-gray-500 mb-1">
                    Province
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={filters.province}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Provinces</option>
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North-Western">North-Western</option>
                    <option value="North-Central">North-Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="wasteType" className="block text-xs font-medium text-gray-500 mb-1">
                    Waste Type
                  </label>
                  <select
                    id="wasteType"
                    name="wasteType"
                    value={filters.wasteType}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Types</option>
                    <option value="General">General</option>
                    <option value="Recyclable">Recyclable</option>
                    <option value="Organic">Organic</option>
                    <option value="Hazardous">Hazardous</option>
                    <option value="E-waste">E-waste</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Output Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Output Options
              </label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="format" className="block text-xs font-medium text-gray-500 mb-1">
                    Format
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value="pdf"
                        checked={format === 'pdf'}
                        onChange={() => setFormat('pdf')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">PDF</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value="excel"
                        checked={format === 'excel'}
                        onChange={() => setFormat('excel')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Excel</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={format === 'csv'}
                        onChange={() => setFormat('csv')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">CSV</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={() => setIncludeCharts(!includeCharts)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include charts and visualizations</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Report type selection card component
const ReportTypeCard = ({ type, title, icon, description, selected, onClick }) => {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        selected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center">
        <input
          type="radio"
          name="reportType"
          value={type}
          checked={selected}
          onChange={() => {}}
          className="h-4 w-4 text-green-600 focus:ring-green-500"
        />
        <span className="ml-2 text-xs text-gray-600">Select</span>
      </div>
    </div>
  );
};

// Helper functions for date formatting
function getTodayDate() {
  return formatDateForInput(new Date());
}

function getLastMonthDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return formatDateForInput(date);
}

function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

export default ReportGenerationPage;