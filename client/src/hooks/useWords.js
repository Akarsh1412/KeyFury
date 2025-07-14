import { generate } from "random-words";
import { useState, useCallback } from "react";

const generateWords = (count) => {
  return generate(count).join(" ");
};

const useWords = (count) => {
  const [words, setWords] = useState(generateWords(count));

  const updateWords = useCallback(() => {
    setWords(generateWords(count));
  }, [count]);

  return { words, updateWords };
};

export default useWords;