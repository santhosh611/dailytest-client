// test/frontend/src/pages/admin/QuestionHistory.jsx
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import jsPDF from 'jspdf';

function QuestionHistory() {
    const [questions, setQuestions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ departmentId: '', topic: '' });
    const [selectedDepartmentName, setSelectedDepartmentName] = useState('All Departments');
    const [selectedDate, setSelectedDate] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const departmentsRes = await api.get('/departments');
                setDepartments(departmentsRes.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load departments.');
            }
        };
        fetchDepartments();
    }, []);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const params = new URLSearchParams();
            if (filters.departmentId) {
                params.append('departmentId', filters.departmentId);
            }
            if (filters.topic) {
                params.append('topic', filters.topic);
            }
            if (selectedDate) {
                params.append('date', selectedDate);
            }

            const res = await api.get(`/questions/all?${params.toString()}`);
            setQuestions(res.data);
            setShowResults(true);

            const currentDepartment = departments.find(d => d._id === filters.departmentId);
            setSelectedDepartmentName(currentDepartment ? currentDepartment.name : 'All Departments');

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch questions.');
            setQuestions([]);
            setShowResults(false);
        } finally {
            setLoading(false);
        }
    }, [filters, selectedDate, departments]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowResults(false);
        fetchQuestions();
    };

    const filteredAndSearchedQuestions = questions.filter(question => {
        const matchesSearch = searchTerm.toLowerCase() === '' ||
                              question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              question.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (question.department && question.department.name.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let yPos = 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Question History Report', 10, yPos);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Topic: ${filters.topic || 'All Topics'}`, 10, yPos);
        yPos += 7;
        doc.text(`Department: ${selectedDepartmentName}`, 10, yPos);
        yPos += 7;
        doc.text(`Date: ${selectedDate || 'All Dates'}`, 10, yPos);
        yPos += 10;

        if (filteredAndSearchedQuestions.length === 0) {
            doc.text('No questions found for the selected criteria.', 10, yPos);
            doc.save('question_history_report.pdf');
            return;
        }

        doc.setFontSize(10);
        let questionNumber = 1;
        const startX = 10;
        const lineHeight = 5;

        filteredAndSearchedQuestions.forEach(question => {
            if (yPos + (question.options.length * lineHeight) + 30 > doc.internal.pageSize.height - 10) {
                doc.addPage();
                yPos = 10;
            }

            doc.setFont('helvetica', 'bold');
            doc.text(`${questionNumber}. ${question.questionText}`, startX, yPos);
            yPos += lineHeight * 1.5;

            doc.setFont('helvetica', 'normal');
            question.options.forEach((option, index) => {
                const optionChar = String.fromCharCode(97 + index);
                doc.text(`   ${optionChar}) ${option}`, startX, yPos);
                yPos += lineHeight;
            });

            // Changed for PDF: Display correct answer as 1-based index
            doc.text(`   ✔ Correct Answer: ${question.correctAnswer + 1}`, startX, yPos); // Display 1-based index
            yPos += lineHeight;

            doc.text(`   Difficulty: ${question.difficulty || 'N/A'}`, startX, yPos);
            yPos += lineHeight * 2;

            questionNumber++;
        });

        doc.save('question_history_report.pdf');
        setMessage('PDF generated successfully!');
    };


    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Question History</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="filterDepartment" className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
                        <select
                            id="filterDepartment"
                            name="departmentId"
                            value={filters.departmentId}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 bg-white"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-1">Filter by Date Generated</label>
                        <InputField
                            id="selectedDate"
                            name="selectedDate"
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="filterTopic" className="block text-sm font-medium text-gray-700 mb-1">Filter by Topic (Optional)</label>
                        <InputField
                            id="filterTopic"
                            name="topic"
                            type="text"
                            value={filters.topic}
                            onChange={handleFilterChange}
                            placeholder="e.g., React, MongoDB"
                            className="w-full"
                        />
                    </div>
                </div>
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {loading ? 'Loading...' : 'View Questions'}
                </Button>
            </form>

            {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            {showResults && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Questions Found: {filteredAndSearchedQuestions.length}</h2>
                        {filteredAndSearchedQuestions.length > 0 && (
                            <Button
                                onClick={handleDownloadPdf}
                                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                Download PDF
                            </Button>
                        )}
                    </div>
                    <div className="mb-4">
                        <InputField
                            label="Search Questions"
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search question text, topic, or department name..."
                            className="w-full"
                        />
                    </div>

                    {loading ? (
                        <p>Loading questions...</p>
                    ) : filteredAndSearchedQuestions.length === 0 ? (
                        <p className="text-gray-600">No questions found matching your criteria.</p>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question Text</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAndSearchedQuestions.map(question => (
                                        <tr key={question._id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{question.questionText}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <ul className="list-disc list-inside">
                                                    {question.options.map((opt, i) => (
                                                        <li key={i}>{opt}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{question.correctAnswer + 1}</td> {/* <-- ADDED + 1 HERE */}
                                            <td className="px-6 py-4 text-sm text-gray-500">{question.topic}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{question.department?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{question.difficulty || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(question.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default QuestionHistory;
