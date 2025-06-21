import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

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

    


    // Medal logic for top 3
    const getMedal = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return null;
    };

    // Department badge color palette
    const departmentColors = [
        'bg-blue-100 text-blue-800',
        'bg-purple-100 text-purple-800',
        'bg-green-100 text-green-800',
        'bg-pink-100 text-pink-800',
        'bg-yellow-100 text-yellow-800',
        'bg-indigo-100 text-indigo-800',
    ];
    const getDeptColor = (deptIdx) => departmentColors[deptIdx % departmentColors.length];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4 flex flex-col items-center relative">
            {/* Background blur for glassmorphism */}
            <style>
                {`
                @media (max-width: 640px) {
                  .hide-on-mobile { display: none !important; }
                }
                `}
            </style>
            <div className="w-full max-w-5xl mx-auto my-8 px-2 sm:px-4 py-4 glassy-card rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center tracking-tight">Scoreboard</h1>
                {/* Sticky filter bar */}
                <div className="sticky top-0 z-10 mb-4 bg-white bg-opacity-80 rounded-xl shadow-sm p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2">
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
                    {/* Could add sorting UI here if you add sort later */}
                </div>

                {loading ? (
                    // Animated loader with glass effect
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="w-14 h-14 animate-spin mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="text-blue-700 font-semibold text-lg">Loading scoreboard...</span>
                    </div>
                ) : error ? (
                    <p className="text-center text-red-600 font-semibold py-8">{error}</p>
                ) : scores.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                        <svg width="80" height="80" fill="none" viewBox="0 0 24 24" className="mb-3 text-blue-200">
                            <path fill="currentColor" d="M12 21c5 0 9-3.58 9-8s-4-8-9-8-9 3.58-9 8 4 8 9 8zm0-2c-3.87 0-7-2.91-7-6s3.13-6 7-6 7 2.91 7 6-3.13 6-7 6zm-1-9v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                        </svg>
                        <p className="text-gray-600 text-xl font-medium">No scores available yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-xl">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Worker Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hide-on-mobile">Worker ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-xl">Total Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {scores
                                    .sort((a, b) => b.totalScore - a.totalScore)
                                    .map((scoreEntry, idx) => {
                                        const medal = getMedal(idx);
                                        // Badge color for department
                                        const deptIdx = departments.findIndex((d) => d._id === (scoreEntry.department ? scoreEntry.department._id : ''));
                                        const deptColor = getDeptColor(deptIdx >= 0 ? deptIdx : idx);
                                        // Highlight for top 3
                                        const highlight =
                                            idx === 0
                                                ? 'bg-yellow-50'
                                                : idx === 1
                                                ? 'bg-gray-100'
                                                : idx === 2
                                                ? 'bg-orange-50'
                                                : '';
                                        return (
                                            <tr
                                                key={`${scoreEntry.worker._id}-${scoreEntry.department._id}`}
                                                className={`transition hover:bg-blue-50 ${highlight}`}
                                                style={{ boxShadow: idx < 3 ? '0 2px 12px 0 rgba(251, 191, 36, 0.06)' : undefined }}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-lg font-bold">
                                                    {medal ? (
                                                        <span className="mr-1" title={medal === '🥇' ? 'Top scorer' : ''}>{medal}</span>
                                                    ) : (
                                                        <span className="text-gray-500 font-medium">{idx + 1}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-semibold">
                                                    {scoreEntry.worker ? scoreEntry.worker.name : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600 hide-on-mobile">
                                                    {scoreEntry.worker ? scoreEntry.worker.workerId : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${deptColor}`}>
                                                        {scoreEntry.department ? scoreEntry.department.name : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-blue-800 font-bold text-lg">
                                                    {scoreEntry.totalScore}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Glassmorphism style */}
            <style>
                {`
                .glassy-card {
                    background: rgba(255, 255, 255, 0.90);
                    backdrop-filter: blur(12px) saturate(140%);
                    box-shadow: 0 6px 48px 0 rgba(56, 112, 255, 0.07), 0 1.5px 10px 0 rgba(0,0,0,0.08);
                }
                `}
            </style>
        </div>
    );
}

export default ScoreboardPage;
