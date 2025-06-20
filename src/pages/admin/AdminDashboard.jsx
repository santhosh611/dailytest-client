// frontend/src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx'; //

function AdminDashboard() {
    const { user } = useAuth(); //
    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.name || 'Admin'}!</h1>
            <p className="text-gray-600">This is your administrative dashboard. Use the sidebar to manage departments, workers, and questions.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Manage Departments</h3>
                    <p>Add new departments or view existing ones and their worker counts.</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Manage Workers</h3>
                    <p>Create new worker accounts and assign them to departments.</p>
                </div>
                <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Generate Questions</h3>
                    <p>Generate AI-based MCQ questions for specific topics and departments.</p>
                </div>
                <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">View Scoreboard</h3>
                    <p>Access the cumulative scoreboard to track worker performance.</p>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;