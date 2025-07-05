import { useCallback, useEffect, useRef, useState } from 'react';
import { isKeyboardCodeAllowed } from '../utils/helpers';

const useTypings = (enabled) => {
    const [cursor, setCursor] = useState(0);
    const [typed, setTyped] = useState('');
    const totalTyped = useRef(0);

    const keyDownHandler = useCallback((event) => {
        const { key, code } = event;
        if (!enabled || !isKeyboardCodeAllowed(code))
            return;

        event.preventDefault();
        
        switch (key) {
            case 'Backspace':
                setTyped((prev) => prev.slice(0,-1));
                setCursor((cursor) => cursor-1);
                totalTyped.current -= 1;
                break;
            default:
                setTyped((prev) => prev.concat(key));
                setCursor((cursor) => cursor+1);
                totalTyped.current += 1;
        }
    }, [enabled]);

    const clearTyped = useCallback(() => {
        setTyped('');
        setCursor(0);
    }, []);

    const resetTotalTyped = useCallback(() => {
        totalTyped.current = 0;
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', keyDownHandler);
        return () => window.removeEventListener('keydown', keyDownHandler);
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