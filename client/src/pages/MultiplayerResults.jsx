import { useParams } from 'react-router-dom';

function MultiplayerResults() {
  const { roomId } = useParams();
  
  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="bg-[#1a1a1a] rounded-xl p-8 max-w-md w-full border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Completed!</h1>
        <p className="text-center mb-8">
          Room: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{roomId}</span>
        </p>
        <div className="text-center">
          <button 
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-6 py-3 rounded-lg font-medium"
            onClick={() => window.location.href = '/multiplayer'}
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

export default MultiplayerResults;