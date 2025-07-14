import { useCallback, useEffect, useState } from "react";
import useSyncedTimer from "./useSyncedTimer";
import useWords from "./useWords";
import useTypings from "./useTypings";
import { countErrors } from "../utils/helpers";

const useEngine = (
  numberOfWords,
  countDownSeconds,
  isMultiplayer,
  socket,
  roomId
) => {
  const [state, setState] = useState("start");
  const { words, updateWords } = useWords(numberOfWords);
  const { timeLeft, isRunning, startLocalTimer, resetTimer } = useSyncedTimer(
    socket,
    roomId,
    isMultiplayer,
    countDownSeconds
  );

  const { typed, cursor, totalTyped, clearTyped, resetTotalTyped } = useTypings(
    state !== "finish"
  );
  const [errors, setErrors] = useState(0);
  const [accumulatedErrors, setAccumulatedErrors] = useState(0);

  const isStarting = state === "start" && cursor > 0;
  const areWordsFinished = cursor === words.length;

  // Calculate errors for current word set only
  const calculateCurrentErrors = useCallback(() => {
    if (typed.length === 0) return 0;
    const wordsReached = words.substring(
      0,
      Math.min(typed.length, words.length)
    );
    return countErrors(typed, wordsReached);
  }, [words, typed]);

  // Update errors in real-time
  useEffect(() => {
    if (state === "run" && typed.length > 0) {
      const currentErrors = calculateCurrentErrors();
      setErrors(accumulatedErrors + currentErrors);
    }
  }, [typed, state, calculateCurrentErrors, accumulatedErrors]);

  // Handle multiplayer test start
  useEffect(() => {
    if (!socket || !isMultiplayer) return;

    const handleTestStarted = () => {
      setState("run");
    };

    socket.on("testStarted", handleTestStarted);

    return () => {
      socket.off("testStarted", handleTestStarted);
    };
  }, [socket, isMultiplayer]);

  // Handle single player start
  useEffect(() => {
    if (!isMultiplayer && isStarting) {
      setState("run");
      startLocalTimer(countDownSeconds);
    }
  }, [isStarting, startLocalTimer, isMultiplayer, countDownSeconds]);

  // When timer ends
  useEffect(() => {
    if (!timeLeft && state === "run") {
      console.log("Time's up!");
      setState("finish");
    }
  }, [timeLeft, state]);

  // When User finishes typing all words (single player)
  useEffect(() => {
    if (!isMultiplayer && areWordsFinished) {
      console.log("All words typed!");

      // Accumulate errors from current word set
      const currentWordSetErrors = calculateCurrentErrors();
      setAccumulatedErrors((prev) => prev + currentWordSetErrors);

      updateWords();
      clearTyped();
    }
  }, [
    clearTyped,
    areWordsFinished,
    updateWords,
    isMultiplayer,
    calculateCurrentErrors,
  ]);

  // When User finishes typing all words (multiplayer)
  useEffect(() => {
    if (isMultiplayer && areWordsFinished) {
      console.log("All words typed!");
      setState("finish");
    }
  }, [areWordsFinished, isMultiplayer]);

  const restart = useCallback(() => {
    console.log("Restarting...");
    resetTimer();
    resetTotalTyped();
    setState("start");
    setErrors(0);
    setAccumulatedErrors(0);
    updateWords();
    clearTyped();
  }, [clearTyped, updateWords, resetTimer, resetTotalTyped]);

  return { state, words, timeLeft, typed, errors, totalTyped, restart };
};

export default useEngine;
