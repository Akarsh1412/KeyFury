function GenerateWords({ words }) {
  return (
    <div className="text-slate-500 font-mono text-2xl md:text-3xl leading-relaxed whitespace-pre-wrap break-words select-none">
      {words}
    </div>
  );
}

export default GenerateWords;
