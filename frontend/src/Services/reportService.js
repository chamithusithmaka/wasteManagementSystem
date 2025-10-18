const API_BASE = 'http://localhost:5000/api/reports';

export async function fetchReportData(params) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to fetch report data');
  return res.json();
}

export async function fetchStatusCounts(reportType) {
  const url = reportType === 'Sensor Data'
    ? `${API_BASE}/sensor-status-counts`
    : `${API_BASE}/status-counts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch status counts');
  return res.json();
}

export async function fetchTypeCounts(reportType) {
  const url = reportType === 'Sensor Data'
    ? `${API_BASE}/container-type-counts`
    : `${API_BASE}/waste-type-counts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch type counts');
  return res.json();
}