// src/services/reportService.js
// Service for backend API calls used in ReportVisualizationPage

export async function fetchReportData(params) {
  const response = await fetch('http://localhost:5000/api/reports/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Failed to fetch report data');
  const data = await response.json();
  return data.data;
}

export async function fetchStatusCounts(reportType) {
  const url = reportType === 'Sensor Data'
    ? 'http://localhost:5000/api/reports/sensor-status-counts'
    : 'http://localhost:5000/api/reports/status-counts';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch status counts');
  const data = await response.json();
  return data.data;
}

export async function fetchTypeCounts(reportType) {
  const url = reportType === 'Sensor Data'
    ? 'http://localhost:5000/api/reports/container-type-counts'
    : 'http://localhost:5000/api/reports/waste-type-counts';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch type counts');
  const data = await response.json();
  return data.data;
}
