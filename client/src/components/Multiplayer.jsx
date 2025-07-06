import { PlusCircle, LogIn } from 'lucide-react';
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

  return (
    <section className="min-h-screen bg-[#121212] flex items-center justify-center px-4 py-24">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-xl w-full max-w-xl p-8">
        <h1 className="text-4xl font-extrabold text-white text-center mb-8">
          Multiplayer
        </h1>

        <div className="space-y-8">
          {/* Join Room */}
          <div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter Room Code"
                className="flex-1 px-4 py-2 rounded-md bg-[#0e0e0e] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]"
              />
              <button
                onClick={handleJoin}
                className="flex items-center gap-2 bg-[#d32f2f] text-white px-4 py-2 rounded-md hover:bg-[#b71c1c] transition text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Join
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative text-center">
            <span className="text-slate-600 text-sm">or</span>
          </div>

          {/* Create Room */}
          <div className="text-center">
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-[#1f1f1f] border border-gray-600 text-white px-5 py-2 rounded-md hover:bg-[#2a2a2a] hover:border-[#d32f2f] transition text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4 text-[#ef4444]" />
              Create New Room
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Multiplayer;
