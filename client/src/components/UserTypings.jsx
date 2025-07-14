function UserTypings({ userInput, words, className }) {
  const typedCharacters = userInput.split('');
  return (
    <div className={className}>
      {typedCharacters.map((char, index) => (
        <Character
          key={`${char}_${index}`}
          actual={char}
          expected={words[index]}
        />
      ))}
      {/* Caret */}
      <span className="inline-block w-0.5 h-7 align-middle bg-white animate-pulse -ml-0.8" />
    </div>
  );
}

const Character = ({ actual, expected }) => {
    const isCorrect = actual === expected;
    const isWhiteSpace = expected === ' ';
    let className = '';
    if (isCorrect && !isWhiteSpace) className = 'text-white';
    else if (!isCorrect && !isWhiteSpace) className = 'text-red-500';
    else if (isWhiteSpace && !isCorrect) className = 'bg-red-500';
    return (
        <span className={className}>
            {expected}
        </span>
    );
}

export default UserTypings;