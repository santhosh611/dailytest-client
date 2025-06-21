// frontend/src/pages/worker/WorkerTestPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import QuestionDisplay from '../../components/worker/QuestionDisplay';
import Timer from '../../components/worker/Timer';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import useTestSession from '../../hooks/useTestSession';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button'; // Still used for internal logic, but not necessarily rendered
// Removed: import Tooltip from '../../components/common/Tooltip'; // Tooltip is no longer used

function WorkerTestPage() {
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

  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [localTimeLeft, setLocalTimeLeft] = useState(null);
  // Removed: const [showSubmitButton, setShowSubmitButton] = useState(false); // No longer needed
  const [testScore, setTestScore] = useState(null);
  const [testTotalQuestions, setTestTotalQuestions] = useState(null);
  const [showFinalScoreScreen, setShowFinalScoreScreen] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  // Removed: const [answerConfirmedForCurrentQuestion, setAnswerConfirmedForCurrentQuestion] = useState(false); // No longer needed

  const handleSubmitTestRef = useRef();
  const handleRecordAnswerAndAdvanceRef = useRef(); // Ref for the advance logic
  const questionsRef = useRef(questions);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const selectedOptionRef = useRef(selectedOption);
  const answersRef = useRef(answers);
  const timeUpRef = useRef(timeUp);

  // Keep refs in sync
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);
  useEffect(() => { selectedOptionRef.current = selectedOption; }, [selectedOption]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeUpRef.current = timeUp; }, [timeUp]);

  // Handles test submission to backend
  const handleSubmitTest = useCallback(async () => {
    if (!testAttemptId) return console.error('No testAttemptId');
    const finalAnswers = [...answersRef.current];
    const currQ = questionsRef.current[currentQuestionIndexRef.current];
    // Ensure the last question's answer is recorded if not already
    if (currQ && !finalAnswers.some(a => String(a.questionId) === String(currQ._id))) {
      finalAnswers.push({
        questionId: currQ._id,
        selectedOption: selectedOptionRef.current,
        isCorrect: selectedOptionRef.current === currQ.correctOption,
      });
    }

    setIsLoading(true); // Show loader during submission
    try {
      const { data } = await api.post(`/tests/submit/${testAttemptId}`, { answers: finalAnswers });
      
      setTestScore(data.score);
      setTestTotalQuestions(data.totalQuestions);
      setShowFinalScoreScreen(true); // Show the final score screen

      // Delay navigation to allow user to see the score
      setTimeout(() => {
        setTestStatus('completed');
        navigate('/scoreboard');
      }, 3000); // Redirect after 3 seconds

    } catch (err) {
      console.error('Failed to submit test:', err);
      setError(err.response?.data?.message || 'Submit failed');
      setTestStatus('error');
      setIsLoading(false); // Turn off loading on error
    }
  }, [testAttemptId, navigate, setIsLoading, setError, setTestStatus]);

  useEffect(() => { handleSubmitTestRef.current = handleSubmitTest; }, [handleSubmitTest]);

  // Handles recording answer and advancing to next question or submitting the test
  const handleRecordAnswerAndAdvance = useCallback((selectedOpt, autoSkipped = false) => {
    const idx = currentQuestionIndexRef.current;
    const qs = questionsRef.current;
    const sel = selectedOpt !== undefined ? selectedOpt : selectedOptionRef.current;

    // Record answer
    if (qs[idx]) {
      const isCorrect = sel === qs[idx].correctOption;
      setAnswers(prev => {
        // Prevent adding duplicate answers if function is called multiple times for the same question
        if (prev.some(a => String(a.questionId) === String(qs[idx]._id))) {
            return prev;
        }
        return [...prev, { questionId: qs[idx]._id, selectedOption: sel, isCorrect }];
      });
    }

    // Advance logic: If last question, auto-submit; otherwise, go to next question
    if (idx === qs.length - 1) {
      handleSubmitTestRef.current(); // Auto-submit if it's the last question
    } else {
      const next = idx + 1;
      setCurrentQuestionIndex(next);
      setLocalTimeLeft(durationPerQuestion); // Reset timer locally
      const newStart = new Date();
      setQuestionStartTime(newStart); // Persist new start time
      updateTestProgress(next, newStart);
      setSelectedOption(null); // Clear prior selection
      setTimeUp(false); // Reset timeUp state for next question
    }
  }, [durationPerQuestion, updateTestProgress]);

  useEffect(() => { handleRecordAnswerAndAdvanceRef.current = handleRecordAnswerAndAdvance; }, [handleRecordAnswerAndAdvance]);

  // NEW: Handler for when an option is selected (triggers auto-advance/submit)
  const handleOptionSelectedAndAdvance = useCallback((optIndex) => {
    setSelectedOption(optIndex); // Set the selected option immediately
    setTimeUp(false); // Reset timeUp if user selects an answer
    // Immediately trigger recording answer and advancing/submitting
    handleRecordAnswerAndAdvanceRef.current(optIndex);
  }, []);

  // Initial load / refresh: compute remaining time from backend start
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
        // If time is already up on load, auto-advance/submit
        if (currentQuestionIndexRef.current < questionsRef.current.length - 1) {
          handleRecordAnswerAndAdvance(null, true);
        } else {
          handleSubmitTestRef.current(); // Auto-submit if time's up on last question
        }
        setTimeUp(true); // Indicate time is up on load if rem <= 0
      } else {
        setLocalTimeLeft(rem);
      }
    }
  }, [questionStartTime, durationPerQuestion, questions, currentQuestionIndex, handleRecordAnswerAndAdvance]);

  // Countdown effect
  useEffect(() => {
    if (localTimeLeft > 0) {
      const timer = setInterval(() => {
        setLocalTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimeUp(true); // Set timeUp to true when timer reaches 0
            if (currentQuestionIndexRef.current < questionsRef.current.length - 1) {
              handleRecordAnswerAndAdvance(null, true); // Auto-advance if time runs out
            } else {
              handleSubmitTestRef.current(); // Auto-submit if time runs out on last question
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (localTimeLeft === 0 && !timeUpRef.current) { // Prevent multiple calls if already timeUp
        setTimeUp(true); // Ensure timeUp is set if it reaches 0
        if (currentQuestionIndexRef.current < questionsRef.current.length - 1) {
            handleRecordAnswerAndAdvance(null, true); // Auto-advance if time runs out
        } else {
            handleSubmitTestRef.current(); // Auto-submit if time runs out on last question
        }
    }
  }, [localTimeLeft, handleRecordAnswerAndAdvance]);


  // Derived UI states based on component's internal state
  const isTestCompleted = testStatus === 'completed'; // Check test completion status from useTestSession
  const totalQuestionsCount = questions.length; // Total number of questions
  const questionNumberDisplay = currentQuestionIndex + 1; // 1-based question number for display
  const timerDanger = localTimeLeft <= 5; // For timer styling
  // Options are disabled after selection because handleOptionSelectedAndAdvance immediately advances
  const hasAnsweredCurrentQuestion = selectedOption !== null; 
  const isTimerActive = localTimeLeft > 0; // For Timer component (if passed via prop)

  // --- Render based on loading, errors, or test status ---
  if (isLoading && !showFinalScoreScreen) { // Show Loader for initial test load or submission (unless final score is displayed)
    return <Loader />;
  }
  if (error) { // Show generic error page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 text-xl font-semibold text-red-600">
        Error: {error}
      </div>
    );
  }
  if (testStatus === 'no-test' || questions.length === 0) { // No questions available
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 text-xl font-semibold text-gray-600">
        No questions available.
      </div>
    );
  }
  if (isTestCompleted) { // Test completed, redirecting (after score display)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 text-xl font-semibold text-gray-600">
        Test completed. Redirecting to scoreboard...
      </div>
    );
  }
  
  // If no current question object is available
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 text-xl font-semibold text-gray-600">
        Test data unavailable.
      </div>
    );
  }

  // Console logs for debugging (can be removed later)
  console.log('WorkerTestPage State:');
  console.log('  localTimeLeft:', localTimeLeft);
  console.log('  timerActive (localTimeLeft > 0):', isTimerActive);
  console.log('  selectedOption:', selectedOption);
  console.log('  showFinalScoreScreen:', showFinalScoreScreen);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 px-2 py-6 relative">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-blue-200 opacity-20 rounded-full blur-3xl animate-float1 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[270px] h-[270px] bg-indigo-300 opacity-20 rounded-full blur-3xl animate-float2 -z-10"></div>

      <div className="w-full max-w-lg bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-7 pt-0 flex flex-col items-center">
        {/* Header Section */}
        <div className="w-full flex flex-col items-center py-4 mb-4 border-b border-blue-100">
          <img src="data:image/jpeg;base64,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"
           alt="Daily Test Logo" className="w-14 h-14 mb-1 object-contain rounded-full bg-white shadow" />
          <h2 className="text-2xl font-extrabold text-indigo-800 mb-1 mt-1">Daily Test</h2>
          {/* Question progress */}
          {!isTestCompleted && ( // Use isTestCompleted
            <span className="text-gray-500 text-xs mt-0">Question {questionNumberDisplay} of {totalQuestionsCount}</span>
          )}
        </div>

        {/* Progress Bar & Timer */}
        {/* Render only if not completed */}
        {!isTestCompleted && ( // Use isTestCompleted
          <div className="w-full flex items-center justify-between mb-5">
            <div className="flex-1 h-2 bg-blue-50 rounded-full overflow-hidden mr-4">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${(questionNumberDisplay / totalQuestionsCount) * 100}%` }} // Use derived states
              />
            </div>
            <span className={`flex items-center font-bold px-3 py-1 rounded-xl shadow-sm text-sm transition-all ${timerDanger ? 'bg-red-400 text-white animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
              <FaClock className="mr-1.5" /> {localTimeLeft}s
            </span>
          </div>
        )}

        {/* Question Section */}
        {/* Render only if not completed */}
        {!isTestCompleted && ( // Use isTestCompleted
          <>
            <div className="w-full text-lg sm:text-xl font-semibold text-gray-800 text-center mb-7 min-h-[3rem]">
              {currentQuestion?.questionText}
            </div>
            {/* Options are rendered by QuestionDisplay component */}
            <QuestionDisplay
              question={currentQuestion}
              onOptionSelect={handleOptionSelectedAndAdvance} // Uses new handler for selection and auto-advances/submits
              selectedOption={selectedOption}
              answerSelectedForCurrentQuestion={selectedOption !== null} // Options disabled after selection
              timerActive={isTimerActive} // Timer active
            />
            
            {/* Time's Up message (if timer runs out) */}
            {timeUp && (
              <div className="absolute bottom-5 right-5 text-red-500 font-bold flex items-center bg-red-50 rounded-xl px-3 py-2 shadow animate-shake">
                <FaTimesCircle className="mr-2" /> Time's up!
              </div>
            )}
          </>
        )}

        {/* Completion Card / Final Score Display */}
        {showFinalScoreScreen && ( // Render completion card if showFinalScoreScreen is true
          <div className="w-full flex flex-col items-center justify-center py-10">
            <FaCheckCircle className="text-green-500 text-5xl mb-5 animate-pop" />
            <div className="text-2xl font-bold text-green-700 mb-1">Test Submitted!</div>
            <div className="text-lg text-gray-700 mb-4">Your Score: <span className="font-extrabold text-indigo-700">{testScore}</span> / <span className="font-bold text-gray-600">{testTotalQuestions}</span></div>
            <div className="text-gray-500 mt-2">Thank you for your effort 🎉</div>
            {/* Redirecting message */}
            <p className="text-gray-500 mt-4">Redirecting to scoreboard...</p>
          </div>
        )}

        {/* Local Loading Overlay for submission */}
        {isLoading && !showFinalScoreScreen && ( // Show Loader when submitting and not yet on final score screen
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-3xl z-10">
            <Loader /> {/* Use our custom Loader component */}
          </div>
        )}
      </div>

      {/* Styles - Using 'jsx' prop for inline styles */}
      <style jsx>{`
        .option-btn:disabled {
          cursor: not-allowed;
        }
        .animate-pop {
          animation: cardpop 0.46s cubic-bezier(.37,.93,.6,1.29);
        }
        @keyframes cardpop {
          0% { transform: scale(0.96) translateY(18px); opacity: 0.33;}
          100% { transform: none; opacity: 1; }
        }
        .animate-shake {
          animation: shake 0.52s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px);}
          20%, 80% { transform: translateX(3px);}
          30%, 50%, 70% { transform: translateX(-6px);}
          40%, 60% { transform: translateX(6px);}
        }
        .animate-float1 { animation: float1 8s infinite alternate; }
        .animate-float2 { animation: float2 11s infinite alternate; }
        @keyframes float1 { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
        @keyframes float2 { 0% { transform: translateY(0); } 100% { transform: translateY(-40px); } }
      `}</style>
    </div>
  );
}

export default WorkerTestPage;
