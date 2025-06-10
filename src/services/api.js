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
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending cookies/tokens
});

export default api;
