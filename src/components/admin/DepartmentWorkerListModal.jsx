// frontend/src/components/admin/DepartmentWorkerListModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Assuming you have this configured
import Button from '../common/Button'; // Assuming you have a Button component

function DepartmentWorkerListModal({ isOpen, onClose, departmentId, departmentName }) {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !departmentId) {
            setWorkers([]); // Clear workers when modal is closed or no department is selected
            return;
        }

        const fetchWorkers = async () => {
            setLoading(true);
            setError('');
            try {
                // Use the modified getWorkers endpoint to filter by departmentId
                const res = await api.get(`/workers?departmentId=${departmentId}`);
                setWorkers(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch workers.');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkers();
    }, [isOpen, departmentId]); // Re-fetch when modal opens or departmentId changes

    if (!isOpen) return null; // Don't render anything if the modal is not open

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Workers in {departmentName}
                </h2>

                {loading ? (
                    <p className="text-center">Loading workers...</p>
                ) : error ? (
                    <p className="text-red-600 text-center">{error}</p>
                ) : workers.length === 0 ? (
                    <p className="text-gray-600 text-center">No workers found in this department.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Worker ID
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {workers.map((worker) => (
                                    <tr key={worker._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {worker.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {worker.workerId}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-6 text-center">
                    <Button onClick={onClose} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default DepartmentWorkerListModal;