import GenerateWords from './GenerateWords';
import Timer from './Timer';
import RestartButton from './RestartButton';
import Results from './Results';
import UserTypings from './UserTypings';
import WordsContainer from './WordsContainer';
import useEngine from '../hooks/useEngine';

function Type() {
  const { state, words, timeLeft, typed } = useEngine();

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">

        <div className="flex items-center justify-start">
          <Timer timeLeft={timeLeft} />
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
          <RestartButton handleRestart={() => {}} />
        </div>

        <Results errors={0} accuracy={100} wpm={0} />
      </div>
    </div>
  );
}

export default Type;
