import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

function GenerateQuestions() {
    const [topic, setTopic] = useState('');
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [numQuestions, setNumQuestions] = useState(30); // New state for number of questions
    const [timeDuration, setTimeDuration] = useState('60'); // New state for time duration (in seconds)
    const [difficulty, setDifficulty] = useState('Medium'); // New state for difficulty
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                setDepartments(res.data);
            } catch (err) {
                setError('Failed to load departments.');
            }
        };
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (!topic || !selectedDepartment) {
            setError('Please enter a topic and select a department.');
            setLoading(false);
            return;
        }

        if (numQuestions < 1 || numQuestions > 100) { // Client-side validation
            setError('Number of questions must be between 1 and 100.');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/questions/generate', {
                topic,
                departmentId: selectedDepartment,
                numQuestions,   // Pass new parameter
                timeDuration,   // Pass new parameter (though not used in backend yet, good to send)
                difficulty,     // Pass new parameter
            });
            setMessage(res.data.message);
            setTopic(''); // Clear input
            // Optionally clear other fields or reset to defaults
            setNumQuestions(30);
            setTimeDuration('60');
            setDifficulty('Medium');

        } catch (err) {
            setError(err.response?.data?.message || 'Error generating questions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 min-h-screen">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generate AI-based Questions</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter Topic (e.g., "React Hooks", "MongoDB Aggregation")
                    </label>
                    <input
                        id="topic"
                        type="text"
                        name="topic"
                        placeholder="Enter topic here"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                    />
                </div>
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Department
                    </label>
                    <select
                        id="department"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 bg-white"
                        required
                    >
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* New Feature: Number of Questions */}
                <div>
                    <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Questions (1-100)
                    </label>
                    <input
                        id="numQuestions"
                        type="number"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))}
                        placeholder="30"
                        min="1"
                        max="100"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                    />
                </div>

                {/* New Feature: Time Duration Per Question */}
                <div>
                    <label htmlFor="timeDuration" className="block text-sm font-medium text-gray-700 mb-1">
                        Time Duration Per Question (seconds)
                    </label>
                    <select
                        id="timeDuration"
                        value={timeDuration}
                        onChange={(e) => setTimeDuration(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 bg-white"
                        required
                    >
                        <option value="15">15 seconds</option>
                        <option value="30">30 seconds</option>
                        <option value="60">60 seconds</option>
                        <option value="90">90 seconds</option>
                        <option value="120">120 seconds</option>
                    </select>
                </div>

                {/* New Feature: Difficulty Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Category</label>
                    <div className="mt-2 space-y-2">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-green-600"
                                name="difficulty"
                                value="Easy"
                                checked={difficulty === 'Easy'}
                                onChange={(e) => setDifficulty(e.target.value)}
                            />
                            <span className="ml-2">Easy 🟢</span>
                        </label>
                        <label className="inline-flex items-center ml-6">
                            <input
                                type="radio"
                                className="form-radio text-yellow-600"
                                name="difficulty"
                                value="Medium"
                                checked={difficulty === 'Medium'}
                                onChange={(e) => setDifficulty(e.target.value)}
                            />
                            <span className="ml-2">Medium 🟠</span>
                        </label>
                        <label className="inline-flex items-center ml-6">
                            <input
                                type="radio"
                                className="form-radio text-red-600"
                                name="difficulty"
                                value="Critical"
                                checked={difficulty === 'Critical'}
                                onChange={(e) => setDifficulty(e.target.value)}
                            />
                            <span className="ml-2">Critical 🔴</span>
                        </label>
                        <label className="inline-flex items-center ml-6">
                            <input
                                type="radio"
                                className="form-radio text-gray-600"
                                name="difficulty"
                                value="Mixed"
                                checked={difficulty === 'Mixed'}
                                onChange={(e) => setDifficulty(e.target.value)}
                            />
                            <span className="ml-2">Mixed (Random)</span>
                        </label>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {loading ? 'Generating...' : `Generate ${numQuestions} Questions`}
                </Button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    );
}

export default GenerateQuestions;
