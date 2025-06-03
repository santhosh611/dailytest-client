// frontend/src/pages/admin/ManageDepartments.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import DepartmentWorkerListModal from '../../components/admin/DepartmentWorkerListModal'; // Import the new modal component

function ManageDepartments() {
    const [departmentName, setDepartmentName] = useState('');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false); // Renamed for clarity (add/edit/delete loading)
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // State for editing a department
    const [isEditing, setIsEditing] = useState(false);
    const [currentDepartment, setCurrentDepartment] = useState(null);

    // New states for Worker List Modal
    const [showWorkerListModal, setShowWorkerListModal] = useState(false);
    const [selectedDepartmentIdForWorkers, setSelectedDepartmentIdForWorkers] = useState(null);
    const [selectedDepartmentNameForWorkers, setSelectedDepartmentNameForWorkers] = useState('');


    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch departments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        setMessage('');

        if (!departmentName) {
            setError('Department name is required.');
            setActionLoading(false);
            return;
        }

        try {
            const res = await api.post('/departments', { name: departmentName });
            setMessage(`Department "${res.data.name}" added successfully!`);
            setDepartmentName('');
            fetchDepartments(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add department.');
        } finally {
            setActionLoading(false);
        }
    };

    // --- Edit Department Handlers ---
    const handleEditClick = (department) => {
        setCurrentDepartment(department);
        setDepartmentName(department.name); // Populate form with current name
        setIsEditing(true);
        setError('');
        setMessage('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        setMessage('');

        if (!departmentName) { // Using departmentName state for the edited value
            setError('Department name is required.');
            setActionLoading(false);
            return;
        }

        try {
            const res = await api.put(`/departments/${currentDepartment._id}`, { name: departmentName });
            setMessage(res.data.message);
            setIsEditing(false); // Close edit form
            setCurrentDepartment(null);
            setDepartmentName(''); // Clear form
            fetchDepartments(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update department.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setCurrentDepartment(null);
        setDepartmentName('');
        setError('');
        setMessage('');
    };

    // --- Delete Department Handler ---
    const handleDeleteDepartment = async (departmentId, departmentName) => {
        if (window.confirm(`Are you sure you want to delete department "${departmentName}"? This action cannot be undone if there are assigned workers or questions.`)) {
            try {
                const res = await api.delete(`/departments/${departmentId}`);
                setMessage(res.data.message);
                fetchDepartments(); // Refresh list
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete department.');
            }
        }
    };

    // --- Handler to open Worker List Modal ---
    const handleViewWorkersClick = (departmentId, departmentName) => {
        setSelectedDepartmentIdForWorkers(departmentId);
        setSelectedDepartmentNameForWorkers(departmentName);
        setShowWorkerListModal(true);
    };

    // --- Handler to close Worker List Modal ---
    const handleCloseWorkerListModal = () => {
        setShowWorkerListModal(false);
        setSelectedDepartmentIdForWorkers(null);
        setSelectedDepartmentNameForWorkers('');
    };


    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 min-h-screen">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Departments</h2>

            {/* Add/Edit Department Form */}
            <form onSubmit={isEditing ? handleEditSubmit : handleAddDepartment} className="mb-8 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-medium mb-4">{isEditing ? 'Edit Department' : 'Add New Department'}</h3>
                <InputField
                    label="Department Name"
                    type="text"
                    id="departmentName"
                    value={departmentName} // This is used for both add and edit forms
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="e.g., Software Engineering"
                    required
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
                <div className="flex space-x-2 mt-4">
                    <Button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {actionLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Department' : 'Add Department')}
                    </Button>
                    {isEditing && (
                        <Button
                            type="button"
                            onClick={handleEditCancel}
                            disabled={actionLoading}
                            className="w-full bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 disabled:opacity-50"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </form>

            {/* List Existing Departments */}
            <h3 className="text-xl font-medium mb-4">Existing Departments</h3>
            {loading ? (
                <p>Loading departments...</p>
            ) : error && !isEditing ? (
                <p className="text-red-600">{error}</p>
            ) : departments.length === 0 ? (
                <p className="text-gray-600">No departments found. Add one above!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Workers
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Questions
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {departments.map((dept) => (
                                <tr key={dept._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {dept.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {/* Make worker count clickable */}
                                        <button
                                            onClick={() => handleViewWorkersClick(dept._id, dept.name)}
                                            className="text-blue-600 hover:text-blue-900 underline disabled:opacity-50"
                                            disabled={dept.workerCount === 0 || actionLoading} // Disable if no workers or action is ongoing
                                        >
                                            {dept.workerCount}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {dept.questionCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            onClick={() => handleEditClick(dept)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            disabled={isEditing || actionLoading} // Disable if editing or action is ongoing
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={isEditing || actionLoading} // Disable if editing or action is ongoing
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

            {/* Department Worker List Modal */}
            <DepartmentWorkerListModal
                isOpen={showWorkerListModal}
                onClose={handleCloseWorkerListModal}
                departmentId={selectedDepartmentIdForWorkers}
                departmentName={selectedDepartmentNameForWorkers}
            />
        </div>
    );
}

export default ManageDepartments;