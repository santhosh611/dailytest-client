// frontend/src/hooks/useTestSession.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Assuming api.js is in src/services

const useTestSession = (workerId, departmentId) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(null); // Date object
    const [durationPerQuestion, setDurationPerQuestion] = useState(null); // in seconds
    const [testAttemptId, setTestAttemptId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testStatus, setTestStatus] = useState('loading'); // 'loading', 'in-progress', 'completed', 'no-test', 'error'

    // Function to load/resume the test session from the backend
    const loadTestSession = useCallback(async () => {
        if (!workerId || !departmentId) {
            setError('Worker ID or Department ID missing.');
            setIsLoading(false);
            setTestStatus('error');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/questions/${departmentId}/${workerId}`);

            // ADDED: Check if response.data is valid and contains expected properties
            if (!response.data || !response.data.questionStartTime || !response.data.durationPerQuestion || !response.data.questions) {
                console.error('Backend response data is incomplete:', response.data);
                setError('Failed to load test session: Incomplete data from server.');
                setTestStatus('error');
                setIsLoading(false);
                return;
            }

            const {
                testAttemptId: fetchedTestAttemptId,
                currentQuestionIndex: fetchedIndex,
                questionStartTime: fetchedStartTime,
                durationPerQuestion: fetchedDuration,
                status: fetchedStatus,
                questions: fetchedQuestions,
            } = response.data;

            setTestAttemptId(fetchedTestAttemptId);
            setQuestions(fetchedQuestions);
            setCurrentQuestionIndex(fetchedIndex);
            setQuestionStartTime(new Date(fetchedStartTime)); // Ensure this is a valid Date string
            setDurationPerQuestion(fetchedDuration);
            setTestStatus(fetchedStatus);

        } catch (err) {
            console.error('Failed to load test session (frontend catch):', err.response?.data?.message || err.message, err);
            if (err.response && err.response.status === 403) {
                setError(err.response.data.message);
                setTestStatus('completed');
            } else if (err.response && err.response.status === 404) {
                setError(err.response.data.message);
                setTestStatus('no-test');
            } else {
                setError(err.response?.data?.message || 'Failed to load test session. Please try again.');
                setTestStatus('error');
            }
        } finally {
            setIsLoading(false);
        }
    }, [workerId, departmentId, setError, setIsLoading, setTestStatus]);// Added setTestStatus to dependencies

    // Function to update test progress on the backend
    const updateTestProgress = useCallback(async (newIndex, newStartTime) => {
        if (!testAttemptId) {
            console.error('Test Attempt ID is null. Cannot update progress.');
            return;
        }
        try {
            // This API call remains on /tests/progress as it updates the TestAttempt model
            await api.put('/tests/progress', {
                testAttemptId,
                currentQuestionIndex: newIndex,
                questionStartTime: newStartTime.toISOString(), // Send as ISO string
            });
            // console.log('Test progress updated on backend:', newIndex);
        } catch (err) {
            console.error('Failed to update test progress:', err);
            // Decide how to handle this error (e.g., show a toast notification)
        }
    }, [testAttemptId]);

    // Initial load when component mounts or worker/department IDs change
    useEffect(() => {
        loadTestSession();
    }, [loadTestSession]);

    return {
        questions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        questionStartTime,
        setQuestionStartTime,
        durationPerQuestion,
        testAttemptId,
        updateTestProgress,
        isLoading,
        error,
        testStatus,
        setTestStatus, // <--- EXPOSE setTestStatus
        setIsLoading, // <--- EXPOSE setIsLoading
        setError,     // <--- EXPOSE setError
        loadTestSession
    };
};

export default useTestSession;
