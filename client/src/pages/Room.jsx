import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Copy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/socketContext';
import Chat from '../components/Chat';
import { toast } from 'react-toastify';
import CountdownModal from '../components/CountDownModal';

function Room() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [players, setPlayers] = useState([]);
  const [testStarted, setTestStarted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const isRedirectingToTest = useRef(false);

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

    return () => {
      socket.off('roomUpdate');
    };
  }, [socket, user, roomId]);

  // Handle countdown and test start events
  useEffect(() => {
    if (!socket) return;

    socket.on('gameStarting', ({ countdown }) => {
      setShowCountdown(true);
      setCountdown(countdown);
    });

    socket.on('countdownUpdate', ({ countdown }) => {
      setCountdown(countdown);
    });

    socket.on('testStarted', () => {
      setTestStarted(true);
      setShowCountdown(false);
      isRedirectingToTest.current = true;
      navigate(`/multiplayer/test/${roomId}`);
    });

    return () => {
      socket.off('gameStarting');
      socket.off('countdownUpdate');
      socket.off('testStarted');
    };
  }, [socket, roomId, navigate]);

  // Handle "room not found" errors
  useEffect(() => {
    if (!socket) return;

    socket.on('error', (msg) => {
      toast.error(msg);
      navigate('/multiplayer');
    });

    return () => {
      socket.off('error');
    };
  }, [socket, navigate]);

  // Handle leaving room when component unmounts (except when redirecting to test)
  useEffect(() => {
    return () => {
      // Only leave room if not redirecting to test
      if (!isRedirectingToTest.current && socket && user) {
        socket.emit('leaveRoom', { roomId, userId: user.uid });
      }
    };
  }, [socket, user, roomId]);

  // Handle browser tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && user && !isRedirectingToTest.current) {
        socket.emit('leaveRoom', { roomId, userId: user.uid });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, user, roomId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied!", {
        autoClose: 1500
      });
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
      {showCountdown && <CountdownModal countDown={countdown} />}

      <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-lg w-full max-w-4xl flex flex-col h-[calc(90vh-5rem)]">
        {/* Top Bar */}
        <div className="w-full px-6 py-5 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
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

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Chat Window */}
          <div className="md:w-2/3 border-r border-gray-700 p-4 flex flex-col min-h-0">
            <div className="bg-[#181818] rounded-md p-3 flex-1 flex flex-col min-h-0" style={{ height: '100%' }}>
              <Chat socket={socket} roomId={roomId} user={user} />
            </div>
          </div>

          {/* Players List & Start Button */}
          <div className="md:w-1/3 p-4 flex flex-col justify-between min-h-0">
            <div className="flex-1 overflow-hidden">
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Players ({players.length})</h3>
              <ul className="space-y-2 max-h-[calc(100%-4rem)] overflow-y-auto custom-scrollbar">
                {players.map((player) => (
                  <li
                    key={player.userId}
                    className={`px-3 py-2 rounded-md text-sm text-white border ${
                      player.userId === user?.uid
                        ? 'bg-[#d32f2f] border-[#d32f2f]'
                        : 'bg-[#1f1f1f] border-gray-700'
                    } flex justify-between items-center`}
                  >
                    <span className="truncate max-w-[70%]" style={{ wordBreak: 'break-word' }}>
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

            <div className="mt-4 flex-shrink-0">
              {isLeader && !testStarted && !showCountdown && (
                <button
                  onClick={handleStart}
                  className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-white py-3 rounded-md font-medium transition text-lg"
                >
                  Start Game
                </button>
              )}
              
              {showCountdown && (
                <div className="w-full text-center py-4 bg-[#1f1f1f] rounded-md border border-gray-700">
                  <p className="text-[#ef4444] font-medium text-lg">Starting in {countdown}...</p>
                  <p className="text-sm text-slate-400 mt-2">Get ready to type!</p>
                </div>
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