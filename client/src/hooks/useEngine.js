import { useState } from "react";
import useCountDownTimer from "./useCountDownTimer";
import useWords from "./useWords";
import useTypings from "./useTypings";

const NUMBER_OF_WORDS = 20;
const COUNTDOWN_SECONDS = 30;

const useEngine = () => {
  const [ state, setState ] = useState("start");
  const { words, setWords } = useWords(NUMBER_OF_WORDS);
  const { timeLeft, startCountDown, resetCountDown } = useCountDownTimer(COUNTDOWN_SECONDS);

  const { typed, cursor, totalTyped, clearTyped, resetTotalTyped } = useTypings(state !== "finish");


  return { state, words, timeLeft, typed };
}

export default useEngine;