import { useState, useEffect, useRef } from "react";

const useSyncedTimer = (
  socket,
  roomId,
  isMultiplayer = false,
  initialDuration = 140
) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const lastSyncRef = useRef(Date.now());

  // Update timeLeft when initialDuration changes (for single player)
  useEffect(() => {
    if (!isMultiplayer) {
      setTimeLeft(initialDuration);
    }
  }, [initialDuration, isMultiplayer]);

  // Request initial timer sync when component mounts
  useEffect(() => {
    if (!socket || !isMultiplayer || !roomId) return;
    socket.emit("getTimerSync", { roomId });
  }, [socket, roomId, isMultiplayer]);

  // Listen for timer sync from server
  useEffect(() => {
    if (!socket || !isMultiplayer || !roomId) return;

    const handleTimerSync = ({
      timeLeft: serverTimeLeft,
      isRunning: serverIsRunning,
      serverTime,
    }) => {
      const now = Date.now();
      const networkDelay = (now - serverTime) / 1000;
      const adjustedTimeLeft = Math.max(0, serverTimeLeft - networkDelay);

      setTimeLeft(Math.floor(adjustedTimeLeft));
      setIsRunning(serverIsRunning);
      lastSyncRef.current = now;
    };

    socket.on("timerSync", handleTimerSync);

    return () => {
      socket.off("timerSync", handleTimerSync);
    };
  }, [socket, isMultiplayer, roomId]);

  // Local countdown for both single and multiplayer
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const startLocalTimer = (duration = initialDuration) => {
    if (isMultiplayer) return;

    setTimeLeft(duration);
    setIsRunning(true);
  };

  const resetTimer = () => {
    setTimeLeft(initialDuration);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    timeLeft,
    isRunning,
    startLocalTimer,
    resetTimer,
  };
};

export default useSyncedTimer;
