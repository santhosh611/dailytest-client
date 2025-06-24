// frontend/src/pages/admin/ManageWorkers.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import WorkerFormModal from '../../components/admin/WorkerFormModal'; // Import the new modal component

function ManageWorkers() {
    // Data states
    const [departments, setDepartments] = useState([]);
    const [workers, setWorkers] = useState([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false); // Used for add/edit/delete operations
    const [error, setError] = useState(''); // Error specific to form submission
    const [message, setMessage] = useState(''); // Message specific to form submission
    const [fetchError, setFetchError] = useState(''); // Error for fetching data

    // States for modal visibility and editing mode
    const [isModalOpen, setIsModalOpen] = useState(false); // Controls if the modal is visible
    const [isEditing, setIsEditing] = useState(false); // True if editing, false if adding
    const [currentWorker, setCurrentWorker] = useState(null); // Stores worker data when editing

    // State for search
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWorkersAndDepartments = async () => {
        setLoading(true);
        setFetchError(''); // Clear fetch error before new fetch
        try {
            const [workersRes, departmentsRes] = await Promise.all([
                api.get('/workers'),
                api.get('/departments')
            ]);
            setWorkers(workersRes.data);
            setDepartments(departmentsRes.data);
            setFetchError('');
        } catch (err) {
            setFetchError(err.response?.data?.message || 'Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkersAndDepartments();
    }, []);

    // Function to open modal for adding a new worker
    const handleAddWorkerClick = () => {
        setIsEditing(false);
        setCurrentWorker(null); // No initial data for add
        setIsModalOpen(true);
        setError(''); // Clear previous form errors
        setMessage(''); // Clear previous form messages
    };

    // Function to open modal for editing an existing worker
    const handleEditClick = (worker) => {
        setIsEditing(true);
        // Pass worker data to the modal. Ensure department is _id.
        setCurrentWorker({ ...worker, department: worker.department?._id || '' });
        setIsModalOpen(true);
        setError(''); // Clear previous form errors
        setMessage(''); // Clear previous form messages
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false); // Reset editing state
        setCurrentWorker(null); // Clear current worker data
        setError(''); // Clear any errors
        setMessage(''); // Clear any messages
    };

    // Handle form submission from the modal (for both create and update)
    const handleModalSubmit = async (formData) => {
        setActionLoading(true);
        setError('');
        setMessage('');

        try {
            let res;
            if (isEditing) {
                res = await api.put(`/workers/${currentWorker._id}`, formData);
            } else {
                res = await api.post('/workers', formData);
            }
            setMessage(res.data.message);
            handleCloseModal(); // Close modal on success
            fetchWorkersAndDepartments(); // Refresh lists
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} worker.`);
        } finally {
            setActionLoading(false);
        }
    };

    // --- Delete Worker Handler ---
    const handleDeleteWorker = async (workerId, workerName) => {
        if (window.confirm(`Are you sure you want to delete worker "${workerName}"? This action cannot be undone and will delete all associated scores and test attempts.`)) {
            try {
                setActionLoading(true); // Indicate loading for delete
                const res = await api.delete(`/workers/${workerId}`);
                setMessage(res.data.message);
                fetchWorkersAndDepartments();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete worker.');
            } finally {
                setActionLoading(false); // End loading for delete
            }
        }
    };

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (worker.workerId && worker.workerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (worker.department && worker.department.name && worker.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 min-h-screen">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Employees</h2>

            {/* Add Worker Button */}
            <Button
                onClick={handleAddWorkerClick}
                className="mb-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isModalOpen || actionLoading} // Disable if modal is open or action is ongoing
            >
                Add New Employee
            </Button>

            {/* Global messages (e.g., from delete operation) */}
            {fetchError && <p className="text-red-600 text-sm mb-4">{fetchError}</p>}
            {message && !isModalOpen && <p className="text-green-600 text-sm mb-4">{message}</p>} {/* Show message outside modal */}
            {error && !isModalOpen && <p className="text-red-500 text-sm mb-4">{error}</p>} {/* Show error outside modal */}


            {/* Search Bar */}
            <div className="mb-4">
                <InputField
                    label="Search Employees"
                    type="text"
                   
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Worker List */}
            <h3 className="text-xl font-medium mb-4">Existing Employee</h3>
            {loading ? (
                <p>Loading workers...</p>
            ) : filteredWorkers.length === 0 ? (
                <p className="text-gray-600">No workers found matching your search criteria.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredWorkers.map((worker) => (
                                <tr key={worker._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {worker.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {worker.workerId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {worker.department ? worker.department.name : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            onClick={() => handleEditClick(worker)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            disabled={isModalOpen || actionLoading} // Disable if modal is open or action is ongoing
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteWorker(worker._id, worker.name)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={isModalOpen || actionLoading} // Disable if modal is open or action is ongoing
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Worker Form Modal */}
            <WorkerFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                isEditing={isEditing}
                initialData={currentWorker}
                departments={departments}
                actionLoading={actionLoading}
                error={error} // Pass form-specific error to modal
                message={message} // Pass form-specific message to modal
            />
        </div>
    );
}

export default ManageWorkers;
