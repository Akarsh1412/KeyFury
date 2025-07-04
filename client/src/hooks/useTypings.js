import { useCallback, useEffect, useRef, useState } from 'react';

const isKeyBoardCodeAllowed = (code) => {
    return (
        code.startsWith('Key') || // A-Z
        code.startsWith('Digit') || // 0-9
        code === 'Space' || // Spacebar
        code === 'Backspace'
    );
}

const useTypings = (enabled) => {
    const [cursor, setCursor] = useState(0);
    const [typed, setTyped] = useState('');
    const totalTyped = useRef(0);

    const keyDownHandler = useCallback(({key, code}) => {
        if (!enabled || !isKeyBoardCodeAllowed(code))
            return;
        if (code === 'Backspace') {
            setTyped((prev) => prev.slice(0, -1));
            setCursor((prev) => Math.max(prev - 1, 0));
            totalTyped.current = Math.max(totalTyped.current - 1, 0);
        } else if (key.length === 1) {
            setTyped((prev) => prev + key);
            setCursor((prev) => prev + 1);
            totalTyped.current += 1;
        }
    }, [cursor, enabled]);

    const clearTyped = useCallback(() => {
        setTyped('');
        setCursor(0);
        totalTyped.current = 0;
    }, []);

    const resetTotalTyped = useCallback(() => {
        totalTyped.current = 0;
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', keyDownHandler);

        return () => {
            window.removeEventListener('keydown', keyDownHandler);
        }
    }, [keyDownHandler])

    return {
        typed,
        cursor,
        totalTyped: totalTyped.current,
        clearTyped,
        resetTotalTyped
    }
}

export default useTypings;