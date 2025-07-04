function WordsContainer({ children }) {
  return (
    <div className="relative max-w-4xl mx-auto text-2xl md:text-3xl font-mono leading-relaxed break-words border border-gray-700 bg-[#1a1a1a] px-6 py-8 rounded-lg shadow-md min-h-[180px]">
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
}

export default WordsContainer;
