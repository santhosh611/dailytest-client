// frontend/src/layouts/AdminLayout.jsx
import React, { useState } from 'react'; // Import useState
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar toggle button for mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 text-gray-800 bg-white rounded-md shadow-md"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Admin Sidebar */}
            <aside
                className={`transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 transition-transform duration-300 ease-in-out
                w-64 bg-gray-800 text-white p-6 flex flex-col fixed inset-y-0 left-0 z-50 md:relative md:shadow-none shadow-xl`}
            >
                <h1 className="text-2xl font-bold mb-8 text-center">Admin Panel</h1>
                <nav className="flex-grow">
                    <ul className="space-y-4">
                        <li>
                            <Link to="/admin" className="flex items-center space-x-3 hover:text-blue-300" onClick={() => setIsSidebarOpen(false)}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/departments" className="flex items-center space-x-3 hover:text-blue-300" onClick={() => setIsSidebarOpen(false)}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2m7 0V5a2 2 0 012-2h2a2 2 0 012 2v6m-6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v6" />
                                </svg>
                                <span>Manage Departments</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/workers" className="flex items-center space-x-3 hover:text-blue-300" onClick={() => setIsSidebarOpen(false)}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Manage Workers</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/questions" className="flex items-center space-x-3 hover:text-blue-300" onClick={() => setIsSidebarOpen(false)}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9.297c.504-.633 1.25-1.002 2.072-1.002 1.621 0 3.037 1.35 3.037 3s-1.416 3-3.037 3c-.822 0-1.568-.37-2.072-1.002m0 0a2 2 0 01-3.655-1.554l-1.087-.899V7.123A2 2 0 014.28 5.674c1.622-1.622 4.1-1.622 5.722 0 1.622 1.621 1.622 4.1 0 5.722L8.228 9.297zM20.278 12.028a2 2 0 00-3.655-1.554l-1.087-.899V7.123A2 2 0 0015.72 5.674c1.622-1.622 4.1-1.622 5.722 0 1.622 1.621 1.622 4.1 0 5.722L20.278 12.028z" />
                                </svg>
                                <span>Generate Questions</span>
                            </Link>
                        </li>
                        <li>
    <Link to="/admin/question-history" className="flex items-center space-x-3 hover:text-blue-300" onClick={() => setIsSidebarOpen(false)}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span>Question History</span>
    </Link>
</li>
                        <li>
                            <Link to="/scoreboard" className="flex items-center space-x-3 hover:text-blue-300" onClick={() => setIsSidebarOpen(false)}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c-1.381 0-2.5-1.029-2.5-2.5S7.619 14 9 14s2.5 1.029 2.5 2.5V19M21 17a2.5 2.5 0 00-2.5-2.5c-1.381 0-2.5 1.029-2.5 2.5V19m0 0a2.5 2.5 0 01-2.5 2.5c-1.381 0-2.5-1.029-2.5-2.5V19m-9-3c1.381 0 2.5-1.029 2.5-2.5S7.619 14 9 14V6l-3 1.5M10 6a2.5 2.5 0 00-2.5-2.5c-1.381 0-2.5 1.029-2.5 2.5V6" />
                                </svg>
                                <span>Scoreboard</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button
                    onClick={handleLogout}
                    className="mt-8 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center space-x-2"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
                <Outlet /> {/* Renders nested routes */}
            </main>
        </div>
    );
}

export default AdminLayout;