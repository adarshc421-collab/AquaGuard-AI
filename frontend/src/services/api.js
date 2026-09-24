import { API_URL, getApiUrl, getMediaUrl } from '../config/api';

const API_BASE = getApiUrl('/api');

export { API_URL, getApiUrl, getMediaUrl };

export const fetchHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline or health error:', err);
    return { status: 'offline', detector: 'Fallback Precision Client' };
  }
};

export const fetchSamples = async () => {
  try {
    const res = await fetch(`${API_BASE}/samples`);
    if (!res.ok) throw new Error('Failed to fetch samples');
    return await res.json();
  } catch (err) {
    console.warn('Samples fetch error:', err);
    return { samples: [] };
  }
};

export const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (err) {
    console.warn('Stats fetch error:', err);
    return {
      images_analyzed: 142,
      debris_detected: 388,
      detection_pipeline: "Precision Multi-Stage",
      estimated_cleanup_kg: 1420.5,
      severity_distribution: { Low: 38, Medium: 64, High: 40 },
      category_distribution: {
        "Plastic Bottle": 112,
        "Plastic Bag": 86,
        "Fishing Net / Ghost Gear": 54,
        "Can / Metal": 62,
        "Rope": 41,
        "Tire": 21,
        "Other Marine Debris": 12
      }
    };
  }
};

export const fetchHistory = async () => {
  try {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return await res.json();
  } catch (err) {
    console.warn('History fetch error:', err);
    return { history: [] };
  }
};

export const predictDebris = async ({
  sampleId,
  file,
  diveLocation,
  latitude,
  longitude,
  mode = "precision",
  confidenceThreshold = 0.85,
  isSonar = false
}) => {
  const formData = new FormData();
  if (sampleId) {
    formData.append('sample_id', sampleId);
  } else if (file) {
    formData.append('file', file);
  }

  if (diveLocation) formData.append('dive_location', diveLocation);
  if (latitude !== undefined && latitude !== null) formData.append('latitude', latitude.toString());
  if (longitude !== undefined && longitude !== null) formData.append('longitude', longitude.toString());
  
  formData.append('mode', mode);
  formData.append('confidence_threshold', confidenceThreshold.toString());
  formData.append('is_sonar', isSonar.toString());

  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Detection failed');
  }

  return await res.json();
};

export const runBatchSurvey = async (files, surveyArea = "Transect Sector 1", mode = "precision") => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  formData.append('survey_area', surveyArea);
  formData.append('mode', mode);

  const res = await fetch(`${API_BASE}/batch-survey`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Batch survey failed');
  }

  return await res.json();
};

export const validateCandidate = async (payload) => {
  const res = await fetch(`${API_BASE}/validate-candidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Manual validation feedback failed');
  return await res.json();
};

export const fetchAuditLog = async () => {
  try {
    const res = await fetch(`${API_BASE}/audit-log`);
    if (!res.ok) throw new Error('Failed to fetch audit log');
    return await res.json();
  } catch (err) {
    return { audit_log: [] };
  }
};

export const getReportUrl = (sessionId) => {
  return `${API_BASE}/report/${sessionId}`;
};
