// frontend/src/components/worker/QuestionDisplay.jsx
import React from 'react';

// Change 'handleAnswerSelect' to 'onOptionSelect' to match the prop name from WorkerTestPage.jsx
function QuestionDisplay({ question, selectedAnswer, onOptionSelect, answerSelectedForCurrentQuestion, timerActive }) {
    if (!question) {
        return <p>Loading question...</p>;
    }

    return (
        <div>
            <p className="text-lg font-medium text-gray-900 mb-4">{question.questionText}</p>
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200
                            ${selectedAnswer === option
                                ? 'bg-blue-200 border-blue-600 text-blue-900 font-semibold'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                            }
                            ${answerSelectedForCurrentQuestion || !timerActive ? 'opacity-70 cursor-not-allowed' : ''} `}
                        // Use onOptionSelect here
                        onClick={() => onOptionSelect(option)}
                    >
                        {option}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuestionDisplay;
