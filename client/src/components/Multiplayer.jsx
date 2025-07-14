import { PlusCircle, LogIn, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomId } from '../utils/helpers';
import { useSocket } from '../context/socketContext';
import { useAuth } from '../context/AuthContext';

function Multiplayer() {
  const [roomCode, setRoomCode] = useState('');
  const { socket } = useSocket(); 
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    try {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
      }

      const code = roomCode.trim();
      if (!code) return;

      socket.emit('joinRoom', {
        roomId: code,
        userId: user.uid,
        username: user.displayName || 'Anonymous',
      });

      navigate(`/multiplayer/join/${code}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    handleJoin();
  };

  const handleCreate = () => {
    try {
      const newRoomId = generateRoomId();

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
      }

      socket.emit('createRoom', {
        roomId: newRoomId,
        userId: user.uid,
        username: user.displayName || 'Anonymous',
      }, (response) => {
          if (response?.success) {
            navigate(`/multiplayer/join/${newRoomId}`);
          } else {
            alert(response?.message || "Failed to create room");
          }
        }
      );
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <section className="bg-[#121212] flex items-center justify-center px-4 py-8 min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-xl">
        {/* Back button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-gray-700 text-gray-300 rounded-lg hover:bg-[#2a2a2a] hover:border-gray-600 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-extrabold text-white text-center mb-8">
            Multiplayer
          </h1>

          <div className="space-y-8">
            {/* Join Room Form */}
            <div>
              <form onSubmit={handleJoinSubmit} className="flex flex-col md:flex-row items-center gap-4">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter Room Code"
                  className="flex-1 px-4 py-3 rounded-md bg-[#0e0e0e] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d32f2f] transition-all"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#d32f2f] text-white px-6 py-3 rounded-md hover:bg-[#b71c1c] transition text-sm font-medium min-w-[100px] justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  Join
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#1a1a1a] px-4 text-slate-400">or</span>
              </div>
            </div>

            {/* Create Room */}
            <div className="text-center">
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 bg-[#1f1f1f] border border-gray-600 text-white px-6 py-3 rounded-md hover:bg-[#2a2a2a] hover:border-[#d32f2f] transition text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4 text-[#ef4444]" />
                Create New Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Multiplayer;