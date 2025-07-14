import { Flame } from 'lucide-react';

function LoadingScreen({ message = 'Loading...', subtitle = 'Welcome to KeyFury' }) {
  return (
    <section className="flex items-center justify-center bg-[#121212] px-4 py-8 min-h-[calc(100vh-120px)]">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1a1a1a] rounded-full border-2 border-[#d32f2f] animate-pulse">
            <Flame className="w-10 h-10 text-[#d32f2f]" />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef4444] mx-auto"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          {message}
        </h2>
        
        <p className="text-gray-400 text-lg">
          {subtitle}
        </p>
        
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-[#ef4444] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#ef4444] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#ef4444] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </section>
  );
}

export default LoadingScreen;
