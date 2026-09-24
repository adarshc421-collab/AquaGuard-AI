/**
 * AquaGuard AI — Centralized Frontend API Configuration
 * Supports local development (http://localhost:8000) and production deployment (Render/Vercel)
 */

// Production or dev API URL from Vite environment variable
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

/**
 * Builds a full API endpoint URL
 * @param {string} endpoint - e.g. '/api/health' or 'api/predict'
 * @returns {string} - e.g. 'https://aquaguard-backend.onrender.com/api/health'
 */
export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};

/**
 * Resolves static media/image URLs returned from backend or preset static paths
 * Handles relative paths (/static/...), blob URLs, data URLs, and external links
 * @param {string} path - e.g. '/static/samples/coral_reef_plastics.jpg'
 * @returns {string} - full URL to image asset
 */
export const getMediaUrl = (path = '') => {
  if (!path) return '';
  // Return blob, data, or absolute HTTP/HTTPS URLs as-is
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('blob:') || 
    path.startsWith('data:')
  ) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

export default {
  API_URL,
  getApiUrl,
  getMediaUrl
};
