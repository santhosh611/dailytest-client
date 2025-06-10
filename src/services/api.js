// frontend/src/services/api.js
import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL, // Use the dynamically determined base URL
    headers: {
        'Content-Type': 'application/json',
    },
});


export default api;
