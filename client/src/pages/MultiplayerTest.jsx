import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/socketContext";
import useEngine from "../hooks/useEngine";
import { Timer } from "lucide-react";
import WordsContainer from "../components/WordsContainer";
import GenerateWords from "../components/GenerateWords";
import UserTypings from "../components/UserTypings";
import { calculateRealTimeErrors, calculateWpm } from "../utils/helpers";

function MultiplayerTest() {
  const timeLimit = 140;
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const { state, words, timeLeft, typed, errors, totalTyped } = useEngine(100, timeLimit, true);

  const [players, setPlayers] = useState([]);
  const [wpm, setWpm] = useState(0);
  const [progress, setProg] = useState(0);

  // Socket listeners
  useEffect(() => {
    if (!socket || !user) return;

    socket.on("roomUpdate", setPlayers);
    socket.on("liveStats", setPlayers);
    socket.on("testEnded", () => {
      navigate(`/multiplayer/results/${roomId}`);
    });

    return () => {
      socket.off("roomUpdate");
      socket.off("liveStats");
      socket.off("testStarted");
      socket.off("testEnded");
    };
  }, [socket, user, roomId, navigate]);

  // Local stats (WPM, progress), sync to server
  useEffect(() => {
    if (totalTyped === 0 || state === 'finish') return; 
    
    const currentErrors = calculateRealTimeErrors(typed, words, typed.length);
    const correctCharacters = totalTyped - currentErrors;
    const timeElapsed = timeLimit - timeLeft;

    const nextWpm = calculateWpm(correctCharacters, timeElapsed);
    const progressPercentage = Math.min(100, (typed.length / words.length) * 100);

    setWpm(nextWpm);
    setProg(progressPercentage);

    socket?.emit("updateStats", {
      roomId,
      userId: user.uid,
      wpm: nextWpm,
      progress: progressPercentage
    });

  }, [totalTyped, socket, roomId, user, timeLeft]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex justify-center py-10 px-4">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">

        {/*Typing Test */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <Timer className="w-5 h-5" /> {timeLeft}s
            </div>
            <div className="text-sm md:text-base">
              WPM:&nbsp;<span className="font-bold">{wpm}</span> | Progress:&nbsp;
              <span className="font-bold">{Math.floor(progress)}%</span>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700 shadow-md">
            <WordsContainer className="relative w-full text-xl md:text-2xl font-mono leading-relaxed break-words min-h-[455px]">
              <div className="absolute inset-0">
                <GenerateWords
                  words={words}
                  className="text-slate-500 font-mono text-xl md:text-2xl leading-relaxed whitespace-pre-wrap break-words select-none"
                />
                <UserTypings
                  userInput={typed}
                  words={words}
                  className="absolute inset-0 text-white font-mono text-xl md:text-2xl leading-relaxed whitespace-pre-wrap break-words pointer-events-none"
                />
              </div>
            </WordsContainer>
          </div>
        </div>

        {/*Players Progress */}
        <div className="w-full lg:w-[420px] bg-[#1a1a1a] rounded-xl p-6 border border-gray-700 h-fit">
          <h2 className="text-lg font-semibold mb-4">Players Progress</h2>
          <ul className="space-y-3">
            {players.map((p) => (
              <li
                key={p.userId}
                className="flex flex-col gap-2 bg-[#121212] p-3 rounded-lg"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{p.username}</span>
                  <span>{p.wpm} WPM</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-[#ef4444] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.floor(p.progress))}%` }}
                  ></div>
                </div>
                <div className="text-xs text-right">
                  {Math.min(100, Math.floor(p.progress))}%
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MultiplayerTest;