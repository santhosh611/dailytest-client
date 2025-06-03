// frontend/src/pages/worker/WorkerTestPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Timer from '../../components/worker/Timer'; // Simple timer component

function WorkerTestPage() {
    const { workerId, departmentId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // Array of { questionId, selectedAnswer }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSubmit, setShowSubmit] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(30); // 30 seconds per question

    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await api.get(`/questions/${departmentId}`);
                setQuestions(res.data);
                setLoading(false);
                setTimerActive(true); // Start timer for the first question
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load questions.');
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [departmentId]);

    useEffect(() => {
        if (timerActive && timeRemaining === 0) {
            handleNextQuestion();
        }
    }, [timeRemaining, timerActive]); // Dependency on timeRemaining and timerActive

    const handleAnswerSelect = (option) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = {
            questionId: currentQuestion._id,
            selectedAnswer: option,
        };
        setAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        // If no answer selected, record it as null/empty
        if (!answers[currentQuestionIndex]) {
            setAnswers(prev => {
                const newArr = [...prev];
                newArr[currentQuestionIndex] = {
                    questionId: currentQuestion._id,
                    selectedAnswer: null, // No answer selected
                };
                return newArr;
            });
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setTimeRemaining(30); // Reset timer for next question
        } else {
            // Last question, show submit button
            setShowSubmit(true);
            setTimerActive(false); // Stop timer
        }
    };

    const handleSubmitTest = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/tests/submit', {
                workerId: workerId,
                answers: answers,
            });
            alert(`Test Submitted! Your score: ${res.data.score}/${res.data.totalQuestions}`);
            navigate(`/scoreboard?departmentId=${departmentId}`); // Redirect to scoreboard
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting test.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center p-4">Loading test...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">{error}</div>;
    }

    if (questions.length === 0) {
        return <div className="text-center p-4">No questions available for this department.</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4">
            <div className="container mx-auto p-4 max-w-2xl bg-white rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </h2>

                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-medium">{currentQuestion.questionText}</p>
                    <Timer initialTime={30} onTimeUpdate={setTimeRemaining} active={timerActive} />
                </div>

                <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={index}
                            className={`p-3 border rounded-lg cursor-pointer transition-all duration-200
                                ${answers[currentQuestionIndex]?.selectedAnswer === option
                                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                }`}
                            onClick={() => handleAnswerSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>

                {showSubmit ? (
                    <Button
                        onClick={handleSubmitTest}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg font-semibold"
                    >
                        {loading ? 'Submitting...' : 'Submit Test'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNextQuestion}
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-semibold"
                    >
                        Next Question
                    </Button>
                )}
            </div>
        </div>
    );
}

export default WorkerTestPage;