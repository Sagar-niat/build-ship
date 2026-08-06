const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('trustguard_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function safeFetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    if (!text) {
      return { success: false, error: { message: 'Empty response received from server' } };
    }
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      return { success: false, error: { message: `Server returned invalid JSON response (HTTP ${res.status})` } };
    }
  } catch (err: any) {
    return { success: false, error: { message: err.message || 'Network request failed' } };
  }
}

export async function fetchHealth() {
  return safeFetchJson(`${API_URL}/api/health`);
}

export async function fetchDashboardStats() {
  return safeFetchJson(`${API_URL}/api/dashboard/stats`, { headers: getAuthHeaders() });
}

export async function analyzeThreat(inputText: string, inputType: string = 'MESSAGE') {
  return safeFetchJson(`${API_URL}/api/analyze/threat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ inputText, inputType })
  });
}

export async function analyzePhishing(inputText: string) {
  return safeFetchJson(`${API_URL}/api/analyze/phishing`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ inputText })
  });
}

export async function scanPII(text: string) {
  return safeFetchJson(`${API_URL}/api/privacy/scan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });
}

export async function redactPII(text: string) {
  return safeFetchJson(`${API_URL}/api/privacy/redact`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });
}

export async function fetchSecurityEvents() {
  return safeFetchJson(`${API_URL}/api/security-events`, { headers: getAuthHeaders() });
}

export async function fetchAnomalies() {
  return safeFetchJson(`${API_URL}/api/anomalies`, { headers: getAuthHeaders() });
}

export async function analyzeAnomaly(data: any) {
  return safeFetchJson(`${API_URL}/api/anomalies/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
}

export async function fetchDecisions() {
  return safeFetchJson(`${API_URL}/api/decisions`, { headers: getAuthHeaders() });
}

export async function updateDecision(id: string, operatorDecision: string, operatorNotes?: string) {
  return safeFetchJson(`${API_URL}/api/decisions/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ operatorDecision, operatorNotes })
  });
}

export async function fetchAuditLogs() {
  return safeFetchJson(`${API_URL}/api/audit-logs`, { headers: getAuthHeaders() });
}

export async function loginUser(credentials: any) {
  return safeFetchJson(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
}
