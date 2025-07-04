function Timer({ timeLeft }) {
  return (
    <h2 className="text-xl font-medium text-slate-300">
      Time : <span className="text-white font-semibold">{timeLeft}s</span>
    </h2>
  );
}

export default Timer;
