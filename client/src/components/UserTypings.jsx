function UserTypings({ userInput, ClassName, words }) {
  const typedCharacters = userInput.split('');
  return (
    <div className="absolute inset-0 text-white font-mono text-2xl md:text-3xl leading-relaxed whitespace-pre-wrap break-words pointer-events-none">
      {typedCharacters.map((char, index) => (
        <Character
          key={`${char}_${index}`}
          actual={char}
          expected={words[index]}
        />
      ))}
      {/* Caret */}
      <span className="inline-block w-0.5 h-7 align-middle bg-white animate-pulse ml-0.5" />
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