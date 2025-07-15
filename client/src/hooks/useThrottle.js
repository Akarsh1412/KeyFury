import { useRef, useCallback, useEffect } from 'react';

export const useThrottle = (callback, delay) => {
  const lastRun = useRef(0);
  const timeoutRef = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();

    if (now - lastRun.current >= delay) {
      // Execute immediately if enough time has passed
      callback(...args);
      lastRun.current = now;
    } else {
      // Clear any existing timeout to prevent multiple scheduled calls
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Schedule execution for the remaining time
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
        timeoutRef.current = null;
      }, delay - (now - lastRun.current));
    }
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};