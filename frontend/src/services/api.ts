const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

function getAuthHeaders() {
  const token = localStorage.getItem('trustguard_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/api/health`);
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_URL}/api/dashboard/stats`, { headers: getAuthHeaders() });
  return res.json();
}

export async function analyzeThreat(inputText: string, inputType: string = 'MESSAGE') {
  const res = await fetch(`${API_URL}/api/analyze/threat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ inputText, inputType })
  });
  return res.json();
}

export async function analyzePhishing(inputText: string) {
  const res = await fetch(`${API_URL}/api/analyze/phishing`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ inputText })
  });
  return res.json();
}

export async function scanPII(text: string) {
  const res = await fetch(`${API_URL}/api/privacy/scan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });
  return res.json();
}

export async function redactPII(text: string) {
  const res = await fetch(`${API_URL}/api/privacy/redact`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });
  return res.json();
}

export async function fetchSecurityEvents() {
  const res = await fetch(`${API_URL}/api/security-events`, { headers: getAuthHeaders() });
  return res.json();
}

export async function fetchAnomalies() {
  const res = await fetch(`${API_URL}/api/anomalies`, { headers: getAuthHeaders() });
  return res.json();
}

export async function analyzeAnomaly(data: any) {
  const res = await fetch(`${API_URL}/api/anomalies/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchDecisions() {
  const res = await fetch(`${API_URL}/api/decisions`, { headers: getAuthHeaders() });
  return res.json();
}

export async function updateDecision(id: string, operatorDecision: string, operatorNotes?: string) {
  const res = await fetch(`${API_URL}/api/decisions/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ operatorDecision, operatorNotes })
  });
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_URL}/api/audit-logs`, { headers: getAuthHeaders() });
  return res.json();
}

export async function loginUser(credentials: any) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json();
}
