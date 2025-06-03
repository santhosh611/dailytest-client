import React, { useState, useEffect }  from 'react';
import api from '../services/api';
import Button from '../components/common/Button';

function ScoreboardPage() {
    const [scores, setScores] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                setDepartments(res.data);
            } catch (err) {
                console.error('Failed to load departments:', err);
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            setError('');
            try {
                const url = selectedDepartment ? `/tests/scores?departmentId=${selectedDepartment}` : '/tests/scores';
                const res = await api.get(url);
                setScores(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load scoreboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, [selectedDepartment]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4">
            <div className="container mx-auto p-4 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Scoreboard</h1>

                <div className="mb-6 flex justify-center">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 bg-white"
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p className="text-center">Loading scores...</p>
                ) : error ? (
                    <p className="text-center text-red-600">{error}</p>
                ) : scores.length === 0 ? (
                    <p className="text-center text-gray-600">No scores available yet.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Worker Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Worker ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {scores.map((scoreEntry) => (
                                    <tr key={scoreEntry._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {scoreEntry.worker ? scoreEntry.worker.name : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {scoreEntry.worker ? scoreEntry.worker.workerId : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {scoreEntry.department ? scoreEntry.department.name : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{scoreEntry.totalScore}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ScoreboardPage;