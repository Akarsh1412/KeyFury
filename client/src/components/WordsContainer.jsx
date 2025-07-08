function WordsContainer({ children, className }) {
  return (
    <div className={className}>
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
}

export default WordsContainer;
