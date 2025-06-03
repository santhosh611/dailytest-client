// frontend/src/layouts/AuthLayout.jsx
import React from 'react';

function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
            {children}
        </div>
    );
}

export default AuthLayout;