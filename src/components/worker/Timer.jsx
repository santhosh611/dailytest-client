import React, { useState, useEffect, useRef } from 'react';

function Timer({ initialTime, onTimeUpdate, active }) {
    const [time, setTime] = useState(initialTime);
    const intervalRef = useRef(null);
    const onTimeUpdateRef = useRef(onTimeUpdate);

    useEffect(() => {
        onTimeUpdateRef.current = onTimeUpdate;
    }, [onTimeUpdate]);

    useEffect(() => {
        setTime(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (!active) {
            clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setTime(prev => {
                const newTime = prev - 1;
                return newTime >= 0 ? newTime : 0;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [active]);

    // 🔄 Notify parent when `time` changes
    useEffect(() => {
        if (active && onTimeUpdateRef.current) {
            onTimeUpdateRef.current(time);
        }
    }, [time, active]);

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`text-xl font-bold ${time <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            Time: {formatTime(time)}
        </div>
    );
}

export default Timer;
