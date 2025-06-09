// frontend/src/pages/worker/WorkerTestPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Button from "../../components/common/Button";
import Timer from "../../components/worker/Timer";
import QuestionDisplay from "../../components/worker/QuestionDisplay";

const getLocalStorageKey = (workerId, departmentId, topic) =>
    `test-progress-${workerId}-${departmentId}-${topic}`;

function WorkerTestPage() {
    const { workerId, departmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const topic = queryParams.get('topic');
    const localStorageKey = getLocalStorageKey(workerId, departmentId, topic);

    const loadState = useCallback(() => {
        try {
            const savedState = localStorage.getItem(localStorageKey);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                return {
                    currentQuestionIndex: parsedState.currentQuestionIndex || 0,
                    selectedAnswers: parsedState.selectedAnswers || {},
                    timeRemaining: parsedState.timeRemaining || 15, // Default if not found
                    questions: parsedState.questions || [],
                    initialLoadFromStorage: true
                };
            }
        } catch (e) {
            console.error("Failed to parse saved progress:", e);
            localStorage.removeItem(localStorageKey);
        }
        return {
            currentQuestionIndex: 0,
            selectedAnswers: {},
            timeRemaining: 15, // Default if no stored state
            questions: [],
            initialLoadFromStorage: false
        };
    }, [localStorageKey]);

    const [testState] = useState(() => loadState());
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(testState.currentQuestionIndex);
    const [selectedAnswers, setSelectedAnswers] = useState(testState.selectedAnswers);
    const [questions, setQuestions] = useState(testState.questions);
    const [timeRemaining, setTimeRemaining] = useState(testState.timeRemaining);
    const [defaultQuestionTime, setDefaultQuestionTime] = useState(15); // New state for dynamic default time
    const [hasAnswered, setHasAnswered] = useState(false); // New flag to prevent double triggers

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSubmit, setShowSubmit] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [answerSelectedForCurrentQuestion, setAnswerSelectedForCurrentQuestion] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    const moveToNextQuestionLogic = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            setShowSubmit(true);
        }
    }, [currentQuestionIndex, questions.length]);

    const handleAnswerSelect = useCallback((option) => {
        if (answerSelectedForCurrentQuestion || !currentQuestion) return;

        if (!hasAnswered) { // Only proceed if not already answered/moved
            setHasAnswered(true); // Set flag to true
            setSelectedAnswers(prev => ({
                ...prev,
                [currentQuestion._id]: option,
            }));
            setAnswerSelectedForCurrentQuestion(true);
            setTimerActive(false);

            setTimeout(() => {
                moveToNextQuestionLogic();
            }, 300); // Small delay to show selection
        }
    }, [answerSelectedForCurrentQuestion, currentQuestion, moveToNextQuestionLogic, hasAnswered]); // Added hasAnswered to dependencies

    const handleNextQuestion = useCallback(() => {
        if (!currentQuestion) {
            moveToNextQuestionLogic();
            return;
        }

        if (!hasAnswered) { // Only proceed if not already answered/moved
            setHasAnswered(true); // Set flag to true
            if (selectedAnswers[currentQuestion._id] === undefined) {
                setSelectedAnswers(prev => ({
                    ...prev,
                    [currentQuestion._id]: null, // Mark as skipped
                }));
            }
            moveToNextQuestionLogic();
        }
    }, [currentQuestion, selectedAnswers, moveToNextQuestionLogic, hasAnswered]); // Added hasAnswered to dependencies

    useEffect(() => {
        const initializeTest = async () => {
            setLoading(true);
            setError('');

            if (testState.initialLoadFromStorage && testState.questions.length > 0) {
                setQuestions(testState.questions);
                setCurrentQuestionIndex(testState.currentQuestionIndex);
                setSelectedAnswers(testState.selectedAnswers);
                setTimeRemaining(testState.timeRemaining);
                // Set defaultQuestionTime based on the first question if available in stored state
                if (testState.questions[0] && testState.questions[0].timeDuration) {
                    setDefaultQuestionTime(testState.questions[0].timeDuration);
                }
                setLoading(false);
                setHasAnswered(false); // Reset flag on initial load from storage
                return;
            }

            try {
                const res = await api.get(`/questions/${departmentId}/${workerId}`, {
                    params: { topic }
                });
                setQuestions(res.data);
                setSelectedAnswers({});
                setCurrentQuestionIndex(0);

                // Use the timeDuration from the first question, or default to 15
                const fetchedTimeDuration = res.data[0]?.timeDuration || 15;
                setDefaultQuestionTime(fetchedTimeDuration);
                setTimeRemaining(fetchedTimeDuration); // Initialize time with fetched duration

                if (res.data && res.data.length > 0) {
                    setTimerActive(true);
                } else {
                    setShowSubmit(true); // No questions found, allow submit
                }

                setAnswerSelectedForCurrentQuestion(false);
                setLoading(false);
                setHasAnswered(false); // Reset flag after fresh question fetch
            } catch (err) {
                localStorage.removeItem(localStorageKey);
                if (err.response && err.response.status === 403) {
                    setError(err.response.data.message || `You have already attempted this test.`);
                    setShowSubmit(false);
                } else {
                    setError(err.response?.data?.message || 'Failed to load questions.');
                    setShowSubmit(true); // Allow submit if questions can't be loaded (e.g., empty department)
                }
                setTimerActive(false);
                setLoading(false);
                setHasAnswered(false); // Reset flag on error
            }
        };

        initializeTest();
    }, [departmentId, workerId, topic, localStorageKey, testState]);

    useEffect(() => {
        if (localStorageKey && !loading && !error && !showSubmit) {
            const stateToSave = {
                currentQuestionIndex,
                selectedAnswers,
                timeRemaining,
                questions,
            };
            localStorage.setItem(localStorageKey, JSON.stringify(stateToSave));
        }
    }, [currentQuestionIndex, selectedAnswers, timeRemaining, questions, loading, error, showSubmit, localStorageKey]);

    useEffect(() => {
        if (currentQuestionIndex < questions.length) {
            // Reset timer with the timeDuration of the NEXT question
            // Or use the defaultQuestionTime if questions array might be inconsistent
            setTimeRemaining(questions[currentQuestionIndex]?.timeDuration || defaultQuestionTime);
            setAnswerSelectedForCurrentQuestion(false);
            setTimerActive(true);
            setHasAnswered(false); // Reset flag when moving to a new question
        } else if (questions.length > 0 && currentQuestionIndex === questions.length) {
            setTimerActive(false);
            setShowSubmit(true); // Automatically show submit when all questions are presented
        }
    }, [currentQuestionIndex, questions.length, questions, defaultQuestionTime]);


    useEffect(() => {
        if (timerActive && timeRemaining === 0) {
            handleNextQuestion(); // Move to next question when timer runs out
        }
    }, [timeRemaining, timerActive, handleNextQuestion]);


    const handleSubmitTest = async () => {
        setLoading(true);
        setError('');

        try {
            const answersToSubmit = questions.map(q => ({
                question: q._id,
                selectedAnswer: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : null,
            }));

            const res = await api.post('/tests/submit', {
                workerId,
                answers: answersToSubmit,
            });

            alert(`Test Submitted! Your score: ${res.data.score}/${res.data.totalQuestions}`);
            localStorage.removeItem(localStorageKey);
            navigate(`/scoreboard?departmentId=${departmentId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting test.');
        } finally {
            setLoading(false);
        }
    };



    if (error) {
        return (
            <div className="text-center p-4 text-red-600">
                {error}
                {(error.includes('already attempted') || error.includes('missing')) && (
                    <Button onClick={() => navigate('/worker')} className="mt-4 bg-blue-600 text-white">
                        Go to Dashboard
                    </Button>
                )}
            </div>
        );
    }

    if (questions.length === 0 && !showSubmit) {
        return <div className="text-center p-4 text-gray-600">No questions available for this topic or department.</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl bg-white rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {currentQuestion ? `Question ${currentQuestionIndex + 1} of ${questions.length}` : 'Test Completed'}
            </h2>
            {topic && <p className="text-md font-medium text-gray-600 mb-4">Topic: {topic}</p>}

            <div className="flex justify-between items-start mb-4">
                {currentQuestion ? (
                    <div className="flex-grow">
                        <QuestionDisplay
                            question={currentQuestion}
                            selectedAnswer={selectedAnswers[currentQuestion._id]}
                            handleAnswerSelect={handleAnswerSelect}
                            answerSelectedForCurrentQuestion={answerSelectedForCurrentQuestion}
                            timerActive={timerActive}
                        />
                    </div>
                ) : (
                    <div className="text-center w-full py-10 text-gray-600">
                        Test questions finished.
                    </div>
                )}
                {timerActive && (
                    <Timer
                        initialTime={timeRemaining}
                        onTimeUpdate={setTimeRemaining}
                        active={timerActive}
                    />
                )}
            </div>

            {showSubmit && (questions.length > 0 || Object.keys(selectedAnswers).length > 0) ? (
                <Button
                    onClick={handleSubmitTest}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg font-semibold"
                >
                    {loading ? 'Submitting...' : 'Submit Test'}
                </Button>
            ) : null }
        </div>
    );
}

export default WorkerTestPage;