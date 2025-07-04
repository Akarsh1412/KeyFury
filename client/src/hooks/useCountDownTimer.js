import { useState, useRef, useCallback, use, useEffect } from 'react';

const useCountDownTimer = (seconds) => {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const intervalRef = useRef(null);

    const startCountDown = useCallback(() => {
        console.log("Starting countdown timer");

        intervalRef.current = setInterval(() => {
            setTimeLeft((timeLeft) => timeLeft-1);
        }, 1000)
    }, [setTimeLeft]);

    const resetCountDown = useCallback(() => {
        console.log("reseting Countdown");

        if (intervalRef.current)
            clearInterval(intervalRef.current);

        setTimeLeft(seconds);
    }, [seconds])

    useEffect(() => {
        if (!timeLeft && intervalRef.current) {
            console.log("Countdown finished");
            clearInterval(intervalRef.current);
        }
    }, [timeLeft, intervalRef]);

    return { timeLeft, startCountDown, resetCountDown };
}

export default useCountDownTimer;