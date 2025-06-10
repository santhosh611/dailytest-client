// frontend/src/services/api.js

import axios from 'axios';

let API_BASE_URL;

// Determine if running in production (on Vercel) or locally
if (window.location.hostname === 'dailytest-client.vercel.app') {
  // Production backend URL
  API_BASE_URL = 'https://dailytest-backend.onrender.com';
} else {
  // Local development backend URL
  API_BASE_URL = 'http://localhost:5000';
}

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5000/api', // Use environment variable
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
