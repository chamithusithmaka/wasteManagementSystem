import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import {
  fetchReportData,
  fetchStatusCounts,
  fetchTypeCounts,
} from '../services/reportService';

const ReportVisualizationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = location.state || {};
  const reportType = params.reportType || 'Waste Collection Summary';
  const [reportData, setReportData] = useState(null);
  const [statusCounts, setStatusCounts] = useState(null);
  const [typeCounts, setTypeCounts] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [error, setError] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState('');
  const [feedback, setFeedback] = useState('Report generated successfully!');
  const reportRef = React.useRef();

  // CSV Export
  const handleExportCSV = () => {
    setExporting(true);
    setExportFormat('CSV');
    
    // Prepare CSV data from both status and type counts
    const csvRows = [
      ['Category', 'Type', 'Count'],
      ...statusEntries.map(([status, count]) => ['Status', status, count]),
      ...typeEntries.map(([type, count]) => [
        reportType === 'Sensor Data' ? 'Container Type' : 'Waste Type', 
        type, 
        count
      ])
    ];
    
    const csv = Papa.unparse(csvRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'waste-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);
    }, 1200);
  };

  useEffect(() => {
    setLoadingData(true);
    setError(null);
    fetchReportData(params)
      .then((data) => {
        setReportData(data.data);
        setLoadingData(false);
      })
      .catch((err) => {
        setFeedback('Failed to load report data');
        setError(err?.message || 'Failed to fetch');
        setLoadingData(false);
      });
  }, [params]);

  useEffect(() => {
    setLoadingStatus(true);
    fetchStatusCounts(reportType)
      .then((data) => {
        setStatusCounts(data.data);
        setLoadingStatus(false);
      })
      .catch((err) => {
        setLoadingStatus(false);
      });
  }, [reportType]);

  useEffect(() => {
    setLoadingTypes(true);
    fetchTypeCounts(reportType)
      .then((data) => {
        setTypeCounts(data.data);
        setLoadingTypes(false);
      })
      .catch((err) => {
        setLoadingTypes(false);
      });
  }, [reportType]);

  // Helpers for charts (use statusCounts from backend API)
  const statusEntries = statusCounts?.counts ? Object.entries(statusCounts.counts) : [];
  const totalStatus = statusCounts?.total || statusEntries.reduce((s, [, c]) => s + c, 0);
  const maxStatus = statusEntries.reduce((m, [, c]) => Math.max(m, c), 0) || 1;

  // Helpers for type distribution charts (use typeCounts from backend API)
  const typeEntries = typeCounts?.counts ? Object.entries(typeCounts.counts) : [];
  const totalTypes = typeCounts?.total || typeEntries.reduce((s, [, c]) => s + c, 0);

  // pie slice path generator
  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
  };

  const colors = ['#22c55e', '#a3e635', '#fbbf24', '#38bdf8', '#f87171', '#a78bfa'];

  if (loadingData || loadingStatus || loadingTypes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-green-700 font-semibold">Loading report...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-bold text-red-600 mb-2">Failed to load report</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => {
                // retry
                setLoadingData(true);
                setError(null);
                // trigger effect by re-setting params (navigate state unchanged) - quick approach: call fetch manually
                fetch('http://localhost:5000/api/reports/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(params),
                })
                  .then((r) => r.json())
                  .then((d) => {
                    setReportData(d.data);
                    setLoadingData(false);
                  })
                  .catch((e) => {
                    setError(e.message || 'Retry failed');
                    setLoadingData(false);
                  });
              }}
            >
              Retry
            </button>
            <button className="px-4 py-2 border rounded" onClick={() => navigate('/report-generation')}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  // PDF Export
  const handleExportPDF = async () => {
    if (!reportRef.current) {
      alert('Report reference not found');
      return;
    }

    setExporting(true);
    setExportFormat('PDF');

    try {
      console.log('Starting PDF export...');

      const element = reportRef.current;
      console.log('Element dimensions:', element.offsetWidth, 'x', element.offsetHeight);

      // Wait a moment for the loading state to show
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Skip the modal overlay and action buttons during capture
          return (
            element.classList.contains('fixed') ||
            element.classList.contains('backdrop-blur') ||
            element.classList.contains('animate-') ||
            element.style.backdropFilter ||
            element.closest('.fixed') ||
            element.id === 'action-buttons' ||
            element.closest('#action-buttons')
          );
        },
        onclone: (clonedDoc) => {
          // Remove the modal and action buttons from cloned document
          const modals = clonedDoc.querySelectorAll('.fixed');
          modals.forEach((modal) => modal.remove());

          const actionButtons = clonedDoc.querySelector('#action-buttons');
          if (actionButtons) {
            actionButtons.remove();
          }

          // Improve PDF-specific styling (force hex/rgb colors, remove all filter/backdrop/color-function usage)
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              backdrop-filter: none !important;
              filter: none !important;
              color: #222 !important;
              background: none !important;
              box-shadow: none !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif !important;
              line-height: 1.4 !important;
              background: #fff !important;
            }
            .bg-green-50 { background-color: #f0fdf4 !important; }
            .bg-green-100 { background-color: #dcfce7 !important; }
            .bg-green-200 { background-color: #bbf7d0 !important; }
            .bg-green-300 { background-color: #86efac !important; }
            .bg-green-400 { background-color: #4ade80 !important; }
            .bg-green-500 { background-color: #22c55e !important; }
            .bg-green-600 { background-color: #16a34a !important; }
            .bg-green-700 { background-color: #15803d !important; }
            .bg-green-800 { background-color: #166534 !important; }
            .bg-green-900 { background-color: #14532d !important; }
            .text-green-700 { color: #15803d !important; }
            .text-green-900 { color: #14532d !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-white { color: #ffffff !important; }
            .border-green-200 { border-color: #bbf7d0 !important; }
            h1, h2, h3 {
              font-weight: bold !important;
              margin-bottom: 8px !important;
            }
            h1 {
              font-size: 24px !important;
              text-align: center !important;
              margin-bottom: 16px !important;
              padding: 12px !important;
              border-bottom: 3px solid #15803d !important;
            }
            h2 {
              font-size: 18px !important;
              margin-bottom: 12px !important;
            }
            .rounded-xl, .rounded-2xl {
              border-radius: 8px !important;
              border: 1px solid #bbf7d0 !important;
            }
            .shadow, .shadow-lg, .shadow-xl, .shadow-2xl {
              box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
            }
            td, th {
              border: 1px solid #bbf7d0 !important;
              padding: 8px !important;
              text-align: left !important;
            }
            .grid {
              display: grid !important;
              gap: 16px !important;
            }
            .grid-cols-1 {
              grid-template-columns: 1fr !important;
            }
            .grid-cols-2 {
              grid-template-columns: 1fr 1fr !important;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      console.log('Canvas created:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/png', 1.0);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // If content is taller than one page, handle multiple pages
      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save('waste-report.pdf');
      setTimeout(() => {
        setExporting(false);
        setExportSuccess(true);
      }, 1200);
    } catch (err) {
      setExporting(false);
      setExportSuccess(false);
      setShowExportModal(false);
      alert('Failed to export PDF: ' + (err?.message || err));
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div ref={reportRef} className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-green-700 mb-6 text-center">
          Generated Report – {reportType}
        </h1>
        {feedback && (
          <div className="mb-4 text-green-700 font-semibold text-lg text-center bg-green-100 rounded-lg py-2 shadow">
            {feedback}
          </div>
        )}
        {/* ...existing code... */}
        {/* ...existing code... */}
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart (status counts) */}
          <div className="bg-green-100 rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold text-green-700 mb-4">
              {reportType === 'Sensor Data' ? 'Containers by Status' : 'Collections by Status'}
            </h2>
            <div className="space-y-3">
              {statusEntries.map(([status, count], idx) => (
                <div key={status} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-semibold text-green-700">{status}</div>
                  <div className="flex-1 bg-white rounded overflow-hidden h-6">
                    <div
                      className="h-6 bg-gradient-to-r from-green-400 to-green-700"
                      style={{ width: `${(count / maxStatus) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-green-900 font-bold">{count}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Type Distribution Pie Chart */}
          <div className="bg-green-100 rounded-xl p-6 shadow flex flex-col items-center">
            <h2 className="text-xl font-bold text-green-700 mb-4">
              {reportType === 'Sensor Data' ? 'Container Type Distribution' : 'Waste Type Distribution'}
            </h2>
            {typeEntries.length > 0 ? (
              <>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {(() => {
                    let start = 0;
                    return typeEntries.map(([type, count], i) => {
                      const slice = (count / totalTypes) * 360;
                      const path = describeArc(100, 100, 80, start, start + slice);
                      start += slice;
                      return <path key={type} d={path} fill={colors[i % colors.length]} stroke="#fff" strokeWidth="1" />;
                    });
                  })()}
                </svg>
                <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                  {typeEntries.map(([type, count], i) => (
                    <div key={type} className="flex items-center gap-2 justify-between">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: colors[i % colors.length] }}></span>
                      <span className="text-green-700 text-sm font-semibold mr-5">{type}</span>
                      <span className="text-gray-600 text-xs mr-15">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>No {reportType === 'Sensor Data' ? 'container type' : 'waste type'} data available</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Statistics Table (from backend) - conditional by report type */}
        <div className="bg-green-100 rounded-xl p-6 shadow mb-10">
          <h2 className="text-xl font-bold text-green-700 mb-2">Key Statistics</h2>
          <table className="w-full text-left">
            <tbody>
              {reportType === 'Waste Collection Summary' && (
                <>
                  {/* Show selected collection status from params at the top */}
                  {params.collectionStatus && (
                    <tr className="border-b border-green-200">
                      <td className="py-2 px-4 font-semibold text-green-700">Collection Status</td>
                      <td className="py-2 px-4 text-green-900">{params.collectionStatus}</td>
                    </tr>
                  )}
                  <tr className="border-b border-green-200">
                    <td className="py-2 px-4 font-semibold text-green-700">Total Collections</td>
                    <td className="py-2 px-4 text-green-900">{reportData.totalCollections}</td>
                  </tr>
                  <tr className="border-b border-green-200">
                    <td className="py-2 px-4 font-semibold text-green-700">Total Waste</td>
                    <td className="py-2 px-4 text-green-900">{reportData.totalWaste} kg</td>
                  </tr>
                  {reportData.byStatus && Object.entries(reportData.byStatus).map(([status, count]) => (
                    <tr key={status} className="border-b border-green-200">
                      <td className="py-2 px-4 font-semibold text-green-700">{status}</td>
                      <td className="py-2 px-4 text-green-900">{count}</td>
                    </tr>
                  ))}
                </>
              )}
              {reportType === 'Sensor Data' && (
                <>
                  <tr className="border-b border-green-200">
                    <td className="py-2 px-4 font-semibold text-green-700">Total Containers</td>
                    <td className="py-2 px-4 text-green-900">{reportData.totalContainers}</td>
                  </tr>
                  <tr className="border-b border-green-200">
                    <td className="py-2 px-4 font-semibold text-green-700">Total Container Capacity</td>
                    <td className="py-2 px-4 text-green-900">{reportData.totalContainerCapacity}</td>
                  </tr>
                  <tr className="border-b border-green-200">
                    <td className="py-2 px-4 font-semibold text-green-700">Total Container Level</td>
                    <td className="py-2 px-4 text-green-900">{reportData.totalContainerLevel}</td>
                  </tr>
                  {/* By Status */}
                  {reportData.byStatus && Object.entries(reportData.byStatus).map(([status, count]) => (
                    <tr key={status} className="border-b border-green-200">
                      <td className="py-2 px-4 font-semibold text-green-700">{status}</td>
                      <td className="py-2 px-4 text-green-900">{count}</td>
                    </tr>
                  ))}
                  {/* By Type */}
                  {reportData.byType && Object.entries(reportData.byType).map(([type, count]) => (
                    <tr key={type} className="border-b border-green-200">
                      <td className="py-2 px-4 font-semibold text-green-700">Type: {type}</td>
                      <td className="py-2 px-4 text-green-900">{count}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8" id="action-buttons">
          <button
            className="px-6 py-3 rounded-xl bg-green-800 text-white font-bold shadow-lg transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300"
            onClick={() => navigate('/report-generation', { state: { modify: true } })}
          >
            Modify Parameters
          </button>
          <button
            className="px-6 py-3 rounded-xl bg-green-800 text-white font-bold shadow-lg transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300 flex items-center gap-2"
            onClick={() => setShowExportModal(true)}
          >
            Export Report
          </button>
          {/* Export & Confirmation Modal */}
          {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
                <button
                  className="absolute top-4 right-4 text-green-700 text-xl font-bold"
                  onClick={() => setShowExportModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
                  Choose export format
                </h2>
                {!exporting && !exportSuccess && (
                  <div className="flex flex-col gap-4 items-center">
                    <button
                      className="w-full py-3 rounded-lg bg-green-800 text-white font-bold text-lg shadow transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300"
                      onClick={handleExportPDF}
                    >
                      Export to PDF
                    </button>
                    <button
                      className="w-full py-3 rounded-lg bg-green-800 text-white font-bold text-lg shadow transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300"
                      onClick={handleExportCSV}
                    >
                      Export to CSV
                    </button>
                  </div>
                )}
                {exporting && (
                  <div className="mt-6 flex flex-col items-center">
                    <span className="text-green-700 font-semibold mb-2">
                      Exporting to {exportFormat}...
                    </span>
                    <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-700 h-4 animate-progress-bar"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                )}
                {exportSuccess && (
                  <div className="mt-6 flex flex-col items-center">
                    <svg
                      className="h-10 w-10 text-green-600 mb-2 animate-bounce"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                    <span className="text-green-700 font-bold text-lg mb-2">
                      Report successfully exported!
                    </span>
                    <button
                      className="mt-2 px-6 py-2 rounded-lg bg-green-800 text-white font-bold shadow transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300"
                      onClick={() => {
                        setShowExportModal(false);
                        setExportSuccess(false);
                        setExportFormat('');
                      }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportVisualizationPage;
