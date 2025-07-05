import { useState, useRef, useCallback, useEffect } from 'react';

const useCountDownTimer = (seconds) => {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const intervalRef = useRef(null);
    const hasTimerEnded = timeLeft <= 0;
    const isRunning = intervalRef.current !== null;

    const startCountDown = useCallback(() => {
        console.log("Starting countdown timer");

        intervalRef.current = setInterval(() => {
            setTimeLeft((timeLeft) => timeLeft-1);
        }, 1000)
    }, [setTimeLeft, hasTimerEnded, isRunning]);

    const resetCountDown = useCallback(() => {
        console.log("reseting Countdown");

        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setTimeLeft(seconds);
    }, [seconds])

    useEffect(() => {
        resetCountDown();
    }, [seconds, resetCountDown]);

    useEffect(() => {
        if (hasTimerEnded) {
            console.log("Countdown finished");
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [hasTimerEnded]);

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    return { timeLeft, startCountDown, resetCountDown };
}

export default useCountDownTimer;