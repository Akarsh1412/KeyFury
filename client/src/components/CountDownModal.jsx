import { Timer } from "lucide-react";

function CountdownModal({ countDown }) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center w-full max-w-2xl px-8">
        <div className="mb-12">
          <Timer className="w-20 h-20 text-[#ef4444] mx-auto mb-8" />
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            GET READY
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-medium">
            The typing test will start in...
          </p>
        </div>

        <div className="mb-12">
          <div className="text-9xl md:text-[12rem] font-black text-[#ef4444] mb-4 leading-none">
            {countDown}
          </div>
          
          <div className="text-2xl md:text-3xl text-gray-400 font-bold uppercase tracking-wider">
            {countDown === 1 ? 'SECOND' : 'SECONDS'}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-lg md:text-xl text-gray-300 font-medium">
            All players will be redirected automatically
          </p>
        </div>
      </div>
    </div>
  );
}

export default CountdownModal;
