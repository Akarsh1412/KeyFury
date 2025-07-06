function Results({ state, errors, accuracy, wpm, className }) {
  const stats = [
    { label: 'Errors', value: errors },
    { label: 'Accuracy', value: `${accuracy}%` },
    { label: 'WPM', value: wpm },
  ];

  if (state !== 'finish')
    return null;

  return (
    <div className={`bg-[#1a1a1a] border border-gray-700 p-6 rounded-xl shadow-md text-center max-w-3xl mx-auto ${className || ''}`}>
      <h2 className="text-2xl font-bold text-[#ef4444] mb-6">Your Performance</h2>
      <div className="flex justify-around text-white font-mono">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-1">
            <span className="text-slate-400 text-sm uppercase tracking-wide">{stat.label}</span>
            <span className="text-2xl font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Results;
