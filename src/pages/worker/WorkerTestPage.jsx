// WorkerTestPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionDisplay from '../../components/worker/QuestionDisplay';
import Timer from '../../components/worker/Timer';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import useTestSession from '../../hooks/useTestSession';

const WorkerTestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
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
    setTestStatus,
    setIsLoading,
    setError,
  } = useTestSession(useParams().workerId, useParams().departmentId);

  const [selectedOption, setSelectedOption] = useState(null); // This will now store the INDEX (a number)
  const [answers, setAnswers] = useState([]);
  const [localTimeLeft, setLocalTimeLeft] = useState(null);

  const handleSubmitTestRef = useRef();
  const handleNextQuestionRef = useRef();
  const questionsRef = useRef(questions);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const selectedOptionRef = useRef(selectedOption);
  const answersRef = useRef(answers);

  // keep refs in sync
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);
  useEffect(() => { selectedOptionRef.current = selectedOption; }, [selectedOption]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const handleSubmitTest = useCallback(async () => {
    if (!testAttemptId) return console.error('No testAttemptId');
    const finalAnswers = [...answersRef.current];
    const currQ = questionsRef.current[currentQuestionIndexRef.current];
    if (currQ && !finalAnswers.some(a => String(a.questionId) === String(currQ._id))) {
      finalAnswers.push({
        questionId: currQ._id,
        selectedOption: selectedOptionRef.current, // Sends the INDEX
        isCorrect: selectedOptionRef.current === currQ.correctOption, // Compares INDEX
      });
    }

    setIsLoading(true);
    try {
      const { data } = await api.post(`/tests/submit/${testAttemptId}`, { answers: finalAnswers });
      console.log('Submitted:', data);
      setTestStatus('completed');
      navigate('/scoreboard');
    } catch (err) {
      console.error('Failed to submit test:', err);
      setError(err.response?.data?.message || 'Submit failed');
      setTestStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [testAttemptId, navigate, setIsLoading, setError, setTestStatus]);

  useEffect(() => { handleSubmitTestRef.current = handleSubmitTest; }, [handleSubmitTest]);

  const handleNextQuestion = useCallback((selectedOpt, autoSkipped = false) => {
    const idx = currentQuestionIndexRef.current;
    const qs = questionsRef.current;
    const sel = selectedOpt !== undefined ? selectedOpt : selectedOptionRef.current; // sel is now the index

    // record answer
    if (qs[idx]) {
      const isCorrect = sel === qs[idx].correctOption; // Compares INDEX
      setAnswers(prev =>
        prev.some(a => String(a.questionId) === String(qs[idx]._id))
          ? prev
          : [...prev, { questionId: qs[idx]._id, selectedOption: sel, isCorrect }] // Stores the INDEX
      );
    }

    // end or advance
    if (idx === qs.length - 1) {
      handleSubmitTestRef.current();
    } else {
      const next = idx + 1;
      setCurrentQuestionIndex(next);

      // Reset timer locally
      setLocalTimeLeft(durationPerQuestion);
      // Persist new start time
      const newStart = new Date();
      setQuestionStartTime(newStart);
      updateTestProgress(next, newStart);
      // Clear prior selection
      setSelectedOption(null);
    }
  }, [durationPerQuestion, updateTestProgress]);

  useEffect(() => { handleNextQuestionRef.current = handleNextQuestion; }, [handleNextQuestion]);

  // initial load / refresh: compute remaining time from backend start
  useEffect(() => {
    if (
      questionStartTime &&
      durationPerQuestion !== null &&
      questions.length > 0 &&
      currentQuestionIndex < questions.length
    ) {
      const elapsed = Math.floor((Date.now() - questionStartTime.getTime()) / 1000);
      const rem = durationPerQuestion - elapsed;
      if (rem <= 0) {
        // auto-skip or submit
        if (currentQuestionIndexRef.current < questionsRef.current.length - 1) {
          handleNextQuestionRef.current(null, true);
        } else {
          handleSubmitTestRef.current();
        }
      } else {
        setLocalTimeLeft(rem);
      }
    }
  }, [questionStartTime, durationPerQuestion, questions, currentQuestionIndex]);

  // countdown effect remains unchanged
  useEffect(() => {
    if (localTimeLeft > 0) {
      const timer = setInterval(() => {
        setLocalTimeLeft(prev => { // Corrected: Use setLocalTimeLeft
          if (prev <= 1) {
            clearInterval(timer);
            if (currentQuestionIndexRef.current < questionsRef.current.length - 1) {
              handleNextQuestionRef.current(null, true);
            } else {
              handleSubmitTestRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (localTimeLeft === 0) {
      if (currentQuestionIndexRef.current < questionsRef.current.length - 1) {
        handleNextQuestionRef.current(null, true);
      } else {
        handleSubmitTestRef.current();
      }
    }
  }, [localTimeLeft]);

  // UI states
  if (isLoading) return <div className="text-center py-8">Loading test...</div>;
  if (error)     return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (testStatus === 'no-test' || questions.length === 0)
    return <div className="text-center py-8">No test available.</div>;
  if (testStatus === 'completed')
    return <div className="text-center py-8">Test completed. Redirecting...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return <div className="text-center py-8">Test data unavailable.</div>;
  }
console.log('WorkerTestPage State:');
console.log('  localTimeLeft:', localTimeLeft);
console.log('  timerActive (localTimeLeft > 0):', localTimeLeft > 0);
console.log('  answerSelectedForCurrentQuestion:', answers.some(a => String(a.questionId) === String(currentQuestion._id)));
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Daily Test</h2>
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          {localTimeLeft !== null && (
            <Timer initialTime={localTimeLeft} key={currentQuestionIndex} />
          )}
        </div>
<QuestionDisplay
  question={currentQuestion}
  onOptionSelect={optIndex => {
    setSelectedOption(optIndex);
    handleNextQuestionRef.current(optIndex);
  }}
  selectedOption={selectedOption}
  answerSelectedForCurrentQuestion={answers.some(a => String(a.questionId) === String(currentQuestion._id))}
  timerActive={localTimeLeft > 0}
/>
      </div>
    </div>
  );
};

export default WorkerTestPage;
