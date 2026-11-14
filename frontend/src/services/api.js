const API_BASE = '';

export async function fetchTelemetry() {
  try {
    const res = await fetch(`${API_BASE}/telemetry`);
    if (!res.ok) throw new Error('Telemetry fetch failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) throw new Error('Status fetch failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchRisk() {
  try {
    const res = await fetch(`${API_BASE}/api/risk`);
    if (!res.ok) throw new Error('Risk fetch failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDetections() {
  try {
    const res = await fetch(`${API_BASE}/api/detections`);
    if (!res.ok) throw new Error('Detections fetch failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchAlerts() {
  try {
    const res = await fetch(`${API_BASE}/api/alerts`);
    if (!res.ok) throw new Error('Alerts fetch failed');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function acknowledgeAlert(alertId) {
  try {
    const res = await fetch(`${API_BASE}/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function fetchAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/api/analytics`);
    if (!res.ok) throw new Error('Analytics fetch failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDriver() {
  try {
    const res = await fetch(`${API_BASE}/api/driver`);
    if (!res.ok) throw new Error('Driver fetch failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function toggleDemoMode(enable) {
  try {
    const res = await fetch(`${API_BASE}/api/demo_mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable })
    });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function processFrame(base64Image) {
  try {
    const res = await fetch(`${API_BASE}/api/process_frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function startMonitoring() {
  try {
    const res = await fetch(`${API_BASE}/api/start`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function stopMonitoring() {
  try {
    const res = await fetch(`${API_BASE}/api/stop`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function resetSession() {
  try {
    const res = await fetch(`${API_BASE}/api/reset`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

// ----------------------------------------------------
// EMERGENCY RESPONSE SYSTEM CLIENT API METHODS
// ----------------------------------------------------

export async function fetchActiveIncident() {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/incidents/active`);
    if (!res.ok) throw new Error('Active incident fetch failed');
    return await res.json();
  } catch (err) {
    return { active_incident: null };
  }
}

export async function fetchIncidents() {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/incidents`);
    if (!res.ok) throw new Error('Incidents fetch failed');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function detectEmergency(sensorData) {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sensorData)
    });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function cancelEmergency(incidentId) {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/incidents/${incidentId}/cancel`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function requestEmergencyHelp(incidentId) {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/incidents/${incidentId}/request_help`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function resolveEmergency(incidentId) {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/incidents/${incidentId}/resolve`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function fetchEmergencyContacts() {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/contacts`);
    if (!res.ok) throw new Error('Contacts fetch failed');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function createEmergencyContact(contactData) {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function runEmergencyTest() {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/test`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}

export async function simulateEmergencyAccident() {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/simulate`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { status: 'error' };
  }
}
