import axios from 'axios';

// Determine the backend URL based on environment
let baseURL = '/api'; // Default for Vite dev server proxy

if (typeof window !== 'undefined' && window.electronAPI) {
  // Running in Electron
  baseURL = `${localStorage.getItem('backendUrl') || 'http://localhost:8000'}/api`;
}

// Initialize the backend URL if running in Electron
if (typeof window !== 'undefined' && window.electronAPI && !localStorage.getItem('backendUrl')) {
  window.electronAPI.getBackendUrl().then((url) => {
    localStorage.setItem('backendUrl', url);
    client.defaults.baseURL = `${url}/api`;
  });
}

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
