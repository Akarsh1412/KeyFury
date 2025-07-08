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
  
  const sumErrors = useCallback(() => {
    const wordsReached = words.substring(0, Math.min(cursor, words.length));
    setErrors ((prevErrors) => prevErrors + countErrors(typed, wordsReached));
  }, [words, typed, cursor]);

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
      sumErrors();
    }
  }, [timeLeft, sumErrors, state])

  // When User finishes typing all words
  useEffect(() => {
    if (!isMultiplayer && areWordsFinished) {
      console.log("All words typed!");
      sumErrors();
      updateWords();
      clearTyped();
    }
  }, [ clearTyped, areWordsFinished, updateWords, sumErrors, isMultiplayer]);

  useEffect(() => {
    if (isMultiplayer && areWordsFinished) {
      console.log("All words typed!");
      setState('finish');
      sumErrors();
    }
  }, [ clearTyped, areWordsFinished, updateWords, sumErrors, isMultiplayer]);

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