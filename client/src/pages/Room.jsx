import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Copy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/socketContext';
import Chat from '../components/Chat';

function Room() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [players, setPlayers] = useState([]);
  const [testStarted, setTestStarted] = useState(false);

  // Join room and listen for updates
  useEffect(() => {
    if (!user || !socket || !socket.connected) return;

    setCurrentUser(user.displayName || 'You');

    socket.emit('joinRoom', {
      roomId,
      userId: user.uid,
      username: user.displayName || 'Anonymous',
    });

    socket.on('roomUpdate', (playerData) => {
      setPlayers(playerData);
    });

    socket.on('testStarted', () => {
      setTestStarted(true);
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('testStarted');
    };
  }, [socket, user, roomId]);

  // Handle "room not found" errors
  useEffect(() => {
    if (!socket) return;

    socket.on('error', (msg) => {
      alert(msg);
      navigate('/multiplayer');
    });

    return () => {
      socket.off('error');
    };
  }, [socket, navigate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room ID:', err);
    }
  };

  const handleStart = () => {
    if (!user || !socket) return;
    socket.emit('startTest', {
      roomId,
      userId: user.uid,
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('testStarted', () => {
      navigate(`/multiplayer/test/${roomId}`);
    });

    return () => {
      socket.off('testStarted');
    };
  }, [socket, roomId, navigate]);

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leaveRoom', { roomId, userId: user?.uid });
    }
    navigate('/multiplayer');
  };

  const isLeader = players.some(
    player => player.userId === user?.uid && player.isLeader
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white flex justify-center items-start pt-10 px-4">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-lg w-full max-w-4xl flex flex-col">
        {/* Top Bar */}
        <div className="w-full px-6 py-5 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Logged in as: <span className="text-white font-medium">{currentUser}</span>
              {isLeader && <span className="ml-2 text-xs bg-[#d32f2f] px-2 py-1 rounded">Leader</span>}
            </div>
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1 text-xs px-3 py-2 bg-[#1f1f1f] border border-gray-600 rounded hover:bg-[#2a2a2a] transition text-red-400 hover:text-red-300"
              aria-label="Leave room"
            >
              <LogOut className="w-4 h-4" />
              Leave Room
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">Room ID: {roomId}</span>
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-1 bg-[#1f1f1f] border border-gray-600 rounded hover:bg-[#2a2a2a] transition"
              aria-label="Copy room ID"
            >
              {copied ? 'Copied!' : <Copy className="w-4 h-4 text-[#ef4444]" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-[70vh]">
          {/* Chat Window */}
          <div className="md:w-2/3 border-r border-gray-700 p-4 flex flex-col">
            <div className="bg-[#181818] rounded-md p-3 flex-1 flex flex-col">
              <Chat socket={socket} roomId={roomId} user={user} />
            </div>
          </div>

          {/* Players List & Start Button */}
          <div className="md:w-1/3 p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Players ({players.length})</h3>
              <ul className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {players.map((player) => (
                  <li
                    key={player.userId}
                    className={`px-3 py-2 rounded-md text-sm text-white border ${
                      player.userId === user?.uid
                        ? 'bg-[#d32f2f] border-[#d32f2f]'
                        : 'bg-[#1f1f1f] border-gray-700'
                    } flex justify-between items-center`}
                  >
                    <span className="truncate max-w-[70%]">
                      {player.username}
                      {player.isLeader && <span className="ml-2 text-xs bg-[#d32f2f] px-1 rounded">Leader</span>}
                    </span>
                    {testStarted && (
                      <span className="text-xs bg-[#2a2a2a] px-2 py-1 rounded min-w-[50px] text-center">
                        {Math.min(100, Math.floor(player.progress))}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              {isLeader && !testStarted && (
                <button
                  onClick={handleStart}
                  className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white py-3 rounded-md font-medium transition text-lg"
                >
                  Start Game
                </button>
              )}
              
              {testStarted && (
                <div className="w-full text-center py-4 bg-[#1f1f1f] rounded-md border border-gray-700">
                  <p className="text-[#ef4444] font-medium text-lg">Game in progress</p>
                  <p className="text-sm text-slate-400 mt-2">Type as fast as you can!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scrollbar styling for player list */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f1f1f;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d32f2f;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b71c1c;
        }
      `}</style>
    </div>
  );
}

export default Room;