import React, { useState, useEffect } from 'react';

function Timer({ initialTime, onTimeUpdate, active }) {
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        setTime(initialTime); // Reset time when initialTime changes (e.g., next question)
    }, [initialTime]);

    useEffect(() => {
        if (!active) {
            return; // Stop timer if not active
        }

        const timer = setInterval(() => {
            setTime((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    onTimeUpdate(0); // Notify parent that time is up
                    return 0;
                }
                onTimeUpdate(prevTime - 1); // Notify parent of time change
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount or if active becomes false
    }, [active, onTimeUpdate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`text-xl font-bold ${time <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            Time: {formatTime(time)}
        </div>
    );
}

export default Timer;