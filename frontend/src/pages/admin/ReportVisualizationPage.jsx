import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import { useNavigate, useLocation } from 'react-router-dom';

const dummyStats = [
  { label: 'Total Waste Collected', value: '12,500 kg' },
  { label: 'Average Collection Time', value: '2.3 hrs' },
  { label: 'Zones Covered', value: '8' },
  { label: 'Recycling Rate', value: '42%' },
];

const dummyLineData = [
  { month: 'Jan', value: 1200 },
  { month: 'Feb', value: 1500 },
  { month: 'Mar', value: 1100 },
  { month: 'Apr', value: 1700 },
  { month: 'May', value: 1400 },
];

const dummyPieData = [
  { type: 'Organic', value: 45 },
  { type: 'Plastic', value: 25 },
  { type: 'Glass', value: 10 },
  { type: 'Metal', value: 8 },
  { type: 'Paper', value: 12 },
];

const dummyMapZones = [
  { zone: 'North', color: 'bg-green-300' },
  { zone: 'South', color: 'bg-green-400' },
  { zone: 'East', color: 'bg-green-200' },
  { zone: 'West', color: 'bg-green-500' },
];

const dummyTable = [
  { stat: 'Collections', value: 120 },
  { stat: 'Missed Pickups', value: 3 },
  { stat: 'Avg. Fill Level', value: '67%' },
  { stat: 'Sensor Alerts', value: 5 },
];

const ReportVisualizationPage = () => {
  const reportRef = useRef();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState('');
  const [feedback, setFeedback] = useState('Report generated successfully!');

  const navigate = useNavigate();
  const location = useLocation();
  const reportType = location.state?.reportType || 'Waste Collection Summary';

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
      await new Promise(resolve => setTimeout(resolve, 200));
      
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
          return element.classList.contains('fixed') || 
                 element.classList.contains('backdrop-blur') || 
                 element.classList.contains('animate-') ||
                 element.style.backdropFilter ||
                 element.closest('.fixed') ||
                 element.id === 'action-buttons' ||
                 element.closest('#action-buttons');
        },
        onclone: (clonedDoc) => {
          // Remove the modal and action buttons from cloned document
          const modals = clonedDoc.querySelectorAll('.fixed');
          modals.forEach(modal => modal.remove());
          
          const actionButtons = clonedDoc.querySelector('#action-buttons');
          if (actionButtons) {
            actionButtons.remove();
          }
          
          // Improve PDF-specific styling
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              backdrop-filter: none !important;
              filter: none !important;
              color: rgb(var(--color-value, 0 0 0)) !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif !important;
              line-height: 1.4 !important;
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
            
            /* Enhanced styling for PDF */
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
            /* Better spacing for PDF */
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
        }
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
        
        // First page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // Additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        // Single page
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      const fileName = `Waste-Management-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF download initiated:', fileName);
      
      // Show success after PDF is saved
      setTimeout(() => {
        setExporting(false);
        setExportSuccess(true);
      }, 1000);
      
    } catch (error) {
      console.error('PDF Export failed:', error);
      setExporting(false);
      setExportSuccess(false);
      setFeedback(`PDF export error: ${error.message}`);
      alert(`PDF export failed: ${error.message}`);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    setExporting(true);
    setExportFormat('CSV');
    // Prepare data
    const statsRows = dummyStats.map(s => [s.label, s.value]);
    const tableRows = dummyTable.map(r => [r.stat, r.value]);
    const csvData = [
      ['Key Statistics'],
      ...statsRows,
      [],
      ['Summary Table'],
      ...tableRows,
    ];
    const csv = Papa.unparse(csvData);
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

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div ref={reportRef} className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-green-700 mb-6 text-center">Generated Report – {reportType}</h1>
        {feedback && (
          <div className="mb-4 text-green-700 font-semibold text-lg text-center bg-green-100 rounded-lg py-2 shadow">
            {feedback}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Line/Bar Chart Panel */}
          <div className="bg-green-100 rounded-xl p-6 shadow flex flex-col items-center">
            <h2 className="text-xl font-bold text-green-700 mb-2">Waste Trends (Monthly)</h2>
            <div className="w-full h-40 flex items-end gap-2">
              {dummyLineData.map((d) => (
                <div key={d.month} className="flex flex-col items-center justify-end h-full">
                  <div
                    className="w-8 rounded bg-green-500 transition-all duration-500"
                    style={{ height: `${d.value / 20}px` }}
                  ></div>
                  <span className="text-xs mt-1 text-green-700">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Pie Chart Panel */}
          <div className="bg-green-100 rounded-xl p-6 shadow flex flex-col items-center">
            <h2 className="text-xl font-bold text-green-700 mb-2">Waste Type Distribution</h2>
            <div className="w-32 h-32 relative flex items-center justify-center">
              {/* Simple pie chart using CSS */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                {/* Pie slices */}
                {dummyPieData.map((slice, i) => (
                  <div
                    key={slice.type}
                    className={`absolute w-full h-full rounded-full`}
                    style={{
                      clipPath: `polygon(50% 50%, 0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
                      transform: `rotate(${i * 72}deg) skewY(-54deg)`,
                      background: [
                        '#22c55e', // Organic
                        '#a3e635', // Plastic
                        '#fbbf24', // Glass
                        '#38bdf8', // Metal
                        '#f87171', // Paper
                      ][i],
                    }}
                  ></div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-green-700 font-bold text-lg">100%</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 w-full">
              {dummyPieData.map((slice, i) => (
                <div key={slice.type} className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full`} style={{ background: [
                        '#22c55e',
                        '#a3e635',
                        '#fbbf24',
                        '#38bdf8',
                        '#f87171',
                      ][i] }}></span>
                  <span className="text-green-700 text-sm font-semibold">{slice.type}</span>
                  <span className="text-gray-600 text-xs">{slice.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Map Visualization */}
        <div className="bg-green-100 rounded-xl p-6 shadow mb-10">
          <h2 className="text-xl font-bold text-green-700 mb-2">Collection Zones Map</h2>
          <div className="flex gap-6 justify-center items-center">
            {dummyMapZones.map((zone) => (
              <div key={zone.zone} className={`w-32 h-32 rounded-xl flex items-center justify-center font-bold text-green-900 shadow-lg ${zone.color}`}>{zone.zone}</div>
            ))}
          </div>
        </div>
        {/* Summary Table */}
        <div className="bg-green-100 rounded-xl p-6 shadow mb-10">
          <h2 className="text-xl font-bold text-green-700 mb-2">Key Statistics</h2>
          <table className="w-full text-left">
            <tbody>
              {dummyTable.map((row) => (
                <tr key={row.stat} className="border-b border-green-200">
                  <td className="py-2 px-4 font-semibold text-green-700">{row.stat}</td>
                  <td className="py-2 px-4 text-green-900">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8" id="action-buttons">
          <button
            className="px-6 py-3 rounded-xl bg-green-800 text-white font-bold shadow-lg transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300"
            onClick={() => navigate('/admin/reports', { state: { modify: true } })}
          >
            Modify Parameters
          </button>
          <button
            className="px-6 py-3 rounded-xl bg-green-800 text-white font-bold shadow-lg transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300 flex items-center gap-2"
            onClick={() => setShowExportModal(true)}
          >
            Export Report
          </button>
        </div>
      </div>
      
      {/* Export & Confirmation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-4 right-4 text-green-700 text-xl font-bold" onClick={() => setShowExportModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">Choose export format</h2>
            {!exporting && !exportSuccess && (
              <div className="flex flex-col gap-4 items-center">
                <button
                  className="w-full py-3 rounded-lg bg-green-800 text-white font-bold text-lg shadow transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300"
                  onClick={handleExportPDF}
                >Export to PDF</button>
                <button
                  className="w-full py-3 rounded-lg bg-green-800 text-white font-bold text-lg shadow transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300"
                  onClick={handleExportCSV}
                >Export to CSV</button>
              </div>
            )}
            {exporting && (
              <div className="mt-6 flex flex-col items-center">
                <span className="text-green-700 font-semibold mb-2">Exporting to {exportFormat}...</span>
                <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-green-700 h-4 animate-progress-bar" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
            {exportSuccess && (
              <div className="mt-6 flex flex-col items-center">
                <svg className="h-10 w-10 text-green-600 mb-2 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                <span className="text-green-700 font-bold text-lg mb-2">Report successfully exported!</span>
                <button
                  className="mt-2 px-6 py-2 rounded-lg bg-green-800 text-white font-bold shadow transition duration-200 hover:scale-105 hover:shadow-xl hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-300"
                  onClick={() => { setShowExportModal(false); setExportSuccess(false); setExportFormat(''); }}
                >Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportVisualizationPage;