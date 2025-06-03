// frontend/src/hooks/useAuth.js
import { useState, useEffect } from 'react';
// Removed: import api from '../services/api'; // No longer needed for token verification

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // On component mount, check if user data exists in local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage:", e);
                localStorage.removeItem('user'); // Clear corrupted data
            }
        }
        setLoading(false); // Finished checking local storage
    }, []);

    const login = (userData) => { // Removed 'token' parameter
        localStorage.setItem('user', JSON.stringify(userData)); // Store user object
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user'); // Clear user object
        setUser(null);
    };

    return { user, loading, login, logout };
};