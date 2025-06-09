// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://dailytest-client.vercel.app/', // Your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Removed the request interceptor that added the token header.
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

export default api;
