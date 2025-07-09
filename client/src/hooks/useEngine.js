import { useCallback, useEffect, useState } from "react";
import useCountDownTimer from "./useCountDownTimer";
import useWords from "./useWords";
import useTypings from "./useTypings";
import { countErrors } from "../utils/helpers";

const useEngine = (numberOfWords, countDownSeconds, isMultiplayer) => {
  const [ state, setState ] = useState("start");
  const { words, updateWords } = useWords(numberOfWords);
  const { timeLeft, startCountDown, resetCountDown } = useCountDownTimer(countDownSeconds);

  const { typed, cursor, totalTyped, clearTyped, resetTotalTyped } = useTypings(state !== "finish");

  const [ errors, setErrors ] = useState(0);

  const isStarting = state === "start" && cursor > 0;
  const areWordsFinished = cursor === words.length;

  // Calculate real-time errors
  const calculateRealTimeErrors = useCallback(() => {
    if (typed.length === 0) return 0;
    const wordsReached = words.substring(0, Math.min(typed.length, words.length));
    return countErrors(typed, wordsReached);
  }, [words, typed]);

  // Errors in real-time
  useEffect(() => {
    if (state === "run" && typed.length > 0) {
      const currentErrors = calculateRealTimeErrors();
      setErrors(currentErrors);
    }
  }, [typed, state, calculateRealTimeErrors]);

  // When User starts typing
  useEffect(() => {
    if (isMultiplayer && state === "start") {
      setState("run");
      startCountDown();
    }
  }, [isMultiplayer, state, startCountDown]);

  useEffect(() => {
    if (!isMultiplayer && isStarting) {
      setState("run");
      startCountDown();
    }
  }, [isStarting, startCountDown, isMultiplayer])

  // When Times up 
  useEffect(() => {
    if (!timeLeft && state === "run") {
      console.log("Time's up!");
      setState("finish");
    }
  }, [timeLeft, state])

  // When User finishes typing all words
  useEffect(() => {
    if (!isMultiplayer && areWordsFinished) {
      console.log("All words typed!");
      updateWords();
      clearTyped();
    }
  }, [ clearTyped, areWordsFinished, updateWords, isMultiplayer]);

  useEffect(() => {
    if (isMultiplayer && areWordsFinished) {
      console.log("All words typed!");
      setState('finish');
    }
  }, [ clearTyped, areWordsFinished, updateWords, isMultiplayer]);

  const restart = useCallback(() => {
    console.log("Restarting...");
    resetCountDown();
    resetTotalTyped();
    setState("start");
    setErrors(0);
    updateWords();
    clearTyped();
  }, [clearTyped, updateWords, resetCountDown, resetTotalTyped]);

  return { state, words, timeLeft, typed, errors, totalTyped, restart };
}

export default useEngine;