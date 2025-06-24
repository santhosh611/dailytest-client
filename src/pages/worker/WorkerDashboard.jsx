// frontend/src/pages/worker/WorkerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

function WorkerDashboard() {
    const [workers, setWorkers] = useState([]); // Used for admin view
    const [searchTerm, setSearchTerm] = useState(''); // Used for admin view
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hasTests, setHasTests] = useState(false); // State to track if tests are available for worker
    const [testAlreadyTaken, setTestAlreadyTaken] = useState(false); // <-- NEW STATE
    const [currentDepartmentTopic, setCurrentDepartmentTopic] = useState(null); // NEW STATE: To store the latest topic for navigation


    const navigate = useNavigate();
    const { user } = useAuth(); // The currently logged-in user (from localStorage)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            setHasTests(false); // Reset this state on each fetch
            setTestAlreadyTaken(false); // <-- Reset new state
            setCurrentDepartmentTopic(null); // Reset topic on each fetch


            try {
                if (user?.role === 'admin') {
                    // Admin view: fetch all workers for management
                    const res = await api.get('/workers');
                    setWorkers(res.data);
                } else if (user?.role === 'worker' && user?.department?._id && user?._id) { // Ensure user._id exists
                    // Worker view: check for available tests for their department
                    // Modified: Pass workerId in the URL now
                    const questionsRes = await api.get(`/questions/${user.department._id}/${user._id}`);
                    if (questionsRes.data && questionsRes.data.questions.length > 0) { // Check for questions array in data
                        setHasTests(true); // Tests are available if questions are returned
                        setCurrentDepartmentTopic(questionsRes.data.latestTopic); // Store the latest topic from the backend
                    } else {
                        setHasTests(false); // No questions, so no tests
                        setCurrentDepartmentTopic(null); // No topic available
                    }
                } else {
                    // Not a recognized user role or missing info, redirect to home
                    setWorkers([]); // Clear any previous worker data
                    setError('User not logged in or missing department/worker info.');
                    if (window.location.pathname !== '/') {
                        navigate('/'); // Only navigate if not already on homepage
                    }
                }
            } catch (err) {
                console.error("Error fetching data for dashboard:", err);
                if (err.response && err.response.status === 404 && user?.role === 'worker') {
                    setHasTests(false); // No questions found for department
                    setError(''); // Clear general error as 404 is expected for 'no questions'
                    setCurrentDepartmentTopic(null); // No topic available on 404
                } else if (err.response && err.response.status === 403) { // <-- NEW: Handle 403 response
                    setTestAlreadyTaken(true);
                    setError(err.response?.data?.message || 'You have already taken the test for today.');
                    setHasTests(false); // No new tests available
                    setCurrentDepartmentTopic(null); // No topic available on 403
                } else {
                    setError(err.response?.data?.message || 'Failed to load dashboard data.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, navigate]);

    const handleTakeTest = () => {
        // Ensure currentDepartmentTopic is available before navigating
        if (user.department && user.department._id && user._id && currentDepartmentTopic) {
            // Pass the topic as a query parameter
            navigate(`/worker/${user._id}/test/${user.department._id}?topic=${currentDepartmentTopic}`);
        } else {
            alert('Your profile does not have a department or worker ID assigned, or no test topic is available. Please contact admin.');
        }
    };

    if (user?.role === 'admin') {
        // ... (Admin view code remains the same)
        const filteredWorkers = workers.filter(worker =>
            worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (worker.workerId && worker.workerId.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin: Worker Management</h1>
                <p className="text-gray-600 mb-4">
                    As an administrator, you can view and manage all worker profiles here.
                </p>

                <div className="mb-4">
                    <InputField
                        label="Search Employee Profiles"
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>

                {loading ? (
                    <p>Loading employee profiles...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : filteredWorkers.length === 0 ? (
                    <p className="text-gray-600">No worker profiles found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredWorkers.map(worker => (
                                    <tr key={worker._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.workerId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.department?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Admin specific edit/delete buttons for worker management would go here */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    } else if (user?.role === 'worker') {
        const loggedInWorker = user;

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                    <p className="text-gray-700">Checking test availability...</p>
                </div>
            );
        }

        if (error && !testAlreadyTaken) { // Show general error if not already taken
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            );
        }

        if (!loggedInWorker || !loggedInWorker.department?._id || !loggedInWorker._id) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {loggedInWorker?.name || 'Worker'}!</h1>
                        <p className="text-red-600">Your worker profile or department information is missing. Please contact an administrator.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                 <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {loggedInWorker.name}!</h1>
                    <p className="text-gray-600 mb-4">Department: {loggedInWorker.department?.name || 'N/A'}</p>
                    <p className="text-gray-600 mb-6">ID: {loggedInWorker.workerId}</p>

                    {testAlreadyTaken ? ( // <-- NEW: Display if test already taken
                         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                            <p className="font-bold mb-2">Test Already Taken</p>
                            <p>{error}</p> {/* Display the specific message from backend */}
                        </div>
                    ) : hasTests ? (
                        <Button
                            onClick={handleTakeTest}
                            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 text-lg"
                        >
                            Start Your Department Test
                        </Button>
                    ) : (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                            <p className="font-bold mb-2">No Tests Available</p>
                            <p>There are no tests assigned to your department yet. Please check back later or contact your administrator.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    } else {
        useEffect(() => {
            navigate('/');
        }, [navigate]);
        return null;
    }
}

export default WorkerDashboard;
