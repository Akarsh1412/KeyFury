import { useState } from 'react';
import GenerateWords from './GenerateWords';
import Timer from './Timer';
import RestartButton from './RestartButton';
import Results from '../pages/Results';
import UserTypings from './UserTypings';
import WordsContainer from './WordsContainer';
import useEngine from '../hooks/useEngine';
import { calculateAccuracy, calculateWpm } from '../utils/helpers';

function Type() {
  const [ timeLimit, setTimeLimit ] = useState(30);
  const { state, words, timeLeft, typed, errors, restart, totalTyped } = useEngine(timeLimit);

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Timer timeLeft={timeLeft} />
          
          <div className={`flex flex-wrap justify-center gap-2 transition-opacity ${state !== "start" ? "opacity-0 pointer-events-none h-0 sm:h-auto" : ""}`}>
            {[15, 30, 45, 60].map((time) => (
              <button
                key={time}
                onClick={() => setTimeLimit(time)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeLimit === time
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {time}s
              </button>
            ))}
          </div>
        </div>

        <WordsContainer>
          <div className="absolute inset-0">
            <GenerateWords words={words} />
            <UserTypings
              userInput={typed}
              words={words}
            />
          </div>
        </WordsContainer>

        <div className="flex justify-center">
          <RestartButton handleRestart={restart} />
        </div>

        <Results
          state={state}
          errors={errors}
          accuracy={calculateAccuracy(errors, totalTyped)}
          wpm={calculateWpm(totalTyped-errors, timeLimit-timeLeft)}
          timeLimit={timeLimit}
        />
      </div>
    </div>
  );
}

export default Type;
