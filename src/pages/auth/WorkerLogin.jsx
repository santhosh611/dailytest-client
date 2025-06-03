// frontend/src/pages/auth/WorkerLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import WorkerLoginModal from '../../components/worker/WorkerLoginModal'; // Import the new modal

function WorkerLogin() {
    const [workers, setWorkers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [loginError, setLoginError] = useState(''); // Error specific to login attempt in modal
    const [loadingWorkers, setLoadingWorkers] = useState(true); // Loading state for fetching workers
    const [loginLoading, setLoginLoading] = useState(false); // Loading state for login action

    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const fetchWorkers = async () => {
            setLoadingWorkers(true);
            try {
                const res = await api.get('/workers');
                setWorkers(res.data);
                setLoginError(''); // Clear error on successful fetch
            } catch (err) {
                setLoginError(err.response?.data?.message || 'Failed to load worker profiles.');
            } finally {
                setLoadingWorkers(false);
            }
        };
        fetchWorkers();
    }, []);

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (worker.workerId && worker.workerId.toLowerCase().includes(searchTerm.toLowerCase())) || // Ensure workerId exists before calling toLowerCase
        (worker.department && worker.department.name && worker.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleWorkerClick = (worker) => {
        setSelectedWorker(worker);
        setIsModalOpen(true); // Open the modal
        setLoginError(''); // Clear previous login errors when opening modal
    };

    const handleLoginSubmit = async (worker, password) => {
        setLoginLoading(true);
        setLoginError('');
        try {
            const res = await api.post('/auth/worker/login', {
                workerId: worker.workerId,
                password: password,
            });

            if (!res.data.department || !res.data.department._id) {
                setLoginError('Worker department information is missing from login response. Please contact admin.');
                setLoginLoading(false);
                return;
            }

            login(res.data);
            setIsModalOpen(false); // Close modal on successful login
            navigate(`/worker/${res.data._id}/test/${res.data.department._id}`);

        } catch (err) {
            setLoginError(err.response?.data?.message || 'Invalid password.');
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4 sm:p-6 md:p-8"> {/* Responsive padding */}
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-4xl"> {/* Adjusted responsive max-width */}
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Worker Login</h2>

                <div className="mb-6">
                    <InputField
                        label="Search Worker Profiles"
                        type="text"
                        placeholder="Search by name, ID, or department"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>

                {loadingWorkers ? (
                    <p className="text-center text-gray-700">Loading worker profiles...</p>
                ) : loginError && !isModalOpen ? ( // Show general error only if modal is not open
                    <p className="text-red-600 text-center mb-4">{loginError}</p>
                ) : filteredWorkers.length === 0 ? (
                    <p className="text-center text-gray-600">No workers found matching your search criteria.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-96 overflow-y-auto pr-2"> {/* Responsive grid layout adjusted */}
                        {filteredWorkers.map(worker => (
                            <div
                                key={worker._id}
                                className="p-4 border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50"
                                onClick={() => handleWorkerClick(worker)}
                            >
                                <p className="font-semibold text-lg">{worker.name}</p>
                                <p className="text-sm text-gray-600">Worker ID: {worker.workerId}</p>
                                <p className="text-sm text-gray-600">Department: {worker.department?.name || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <WorkerLoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                worker={selectedWorker}
                onSubmit={handleLoginSubmit}
                loading={loginLoading}
                error={loginError}
            />
        </div>
    );
}

export default WorkerLogin;