import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/socketContext";
import useEngine from "../hooks/useEngine";
import { Timer, Clock, Users } from "lucide-react";
import WordsContainer from "../components/WordsContainer";
import GenerateWords from "../components/GenerateWords";
import UserTypings from "../components/UserTypings";
import {
  calculateAccuracy,
  calculateRealTimeErrors,
  calculateWpm,
} from "../utils/helpers";

function MultiplayerTest() {
  const timeLimit = 140;
  const wordLimit = 100;
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const { state, words, timeLeft, typed, errors, totalTyped } = useEngine(
    wordLimit,
    timeLimit,
    true
  );

  const [players, setPlayers] = useState([]);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [progress, setProg] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showWaitingScreen, setShowWaitingScreen] = useState(false);

  // Socket listeners
  useEffect(() => {
    if (!socket || !user) return;

    socket.on("roomUpdate", setPlayers);
    socket.on("liveStats", setPlayers);

    socket.on("playerFinished", (data) => {
      setIsFinished(true);
      setShowWaitingScreen(true);
    });

    socket.on("testEnded", (data) => {
      navigate(`/multiplayer/results/${roomId}`);
    });

    return () => {
      socket.off("roomUpdate");
      socket.off("liveStats");
      socket.off("playerFinished");
      socket.off("testEnded");
    };
  }, [socket, user, roomId, navigate]);

  // Local stats (WPM, progress), sync to server
  useEffect(() => {
    if (totalTyped === 0 || state === "finish" || isFinished) return;

    const currentErrors = calculateRealTimeErrors(typed, words, typed.length);
    const correctCharacters = totalTyped - currentErrors;
    const timeElapsed = timeLimit - timeLeft;

    const nextWpm = calculateWpm(correctCharacters, timeElapsed);
    const progressPercentage = Math.min(
      100,
      (typed.length / words.length) * 100
    );
    const nextAccuracy = calculateAccuracy(errors, totalTyped);

    setWpm(nextWpm);
    setProg(progressPercentage);
    setAccuracy(nextAccuracy);

    socket?.emit("updateStats", {
      roomId,
      userId: user.uid,
      wpm: nextWpm,
      progress: progressPercentage,
      accuracy: nextAccuracy,
    });
  }, [totalTyped, socket, roomId, user, timeLeft, isFinished]);

  // Handle time up
  useEffect(() => {
    if (timeLeft <= 0 && !isFinished) {
      socket?.emit("endTest", { roomId });
    }
  }, [timeLeft, socket, roomId, isFinished]);

  // Handle test completion when user finishes typing
  useEffect(() => {
    if (progress >= 100 && !isFinished) {
      setIsFinished(true);
    }
  }, [progress, isFinished]);

  // Waiting screen component
  const WaitingScreen = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-700 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            <Clock className="w-16 h-16 text-[#ef4444] mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-white mb-2">Great Job!</h2>
            <p className="text-gray-300">
              You finished the test! Waiting for other players...
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#121212] p-3 rounded-lg">
              <span className="text-gray-400">Your WPM:</span>
              <span className="text-white font-bold">{Math.floor(wpm)}</span>
            </div>
            <div className="flex justify-between items-center bg-[#121212] p-3 rounded-lg">
              <span className="text-gray-400">Your Accuracy:</span>
              <span className="text-white font-bold">
                {Math.floor(accuracy)}%
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-3">
              <Users className="w-4 h-4" />
              <span className="text-sm">Other players still typing...</span>
            </div>
            <div className="space-y-2">
              {players
                .filter((p) => p.progress < 100)
                .map((player) => (
                  <div
                    key={player.userId}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-300">{player.username}</span>
                    <span className="text-[#ef4444]">
                      {Math.floor(player.progress)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white flex justify-center py-10 px-4">
      {showWaitingScreen && <WaitingScreen />}

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">
        {/*Typing Test */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <Timer className="w-5 h-5" /> {timeLeft}s
            </div>
            <div className="text-sm md:text-base">
              WPM: <span className="font-bold">{Math.floor(wpm)}</span> |
              Accuracy:{" "}
              <span className="font-bold">{Math.floor(accuracy)}%</span> |
              Progress:{" "}
              <span className="font-bold">{Math.floor(progress)}%</span>
            </div>
          </div>

          <div
            className={`bg-[#1a1a1a] rounded-xl p-4 border border-gray-700 shadow-md ${
              isFinished ? "opacity-50" : ""
            }`}
          >
            <WordsContainer className="relative w-full text-xl md:text-2xl font-mono leading-relaxed break-words min-h-[455px]">
              <div className="absolute inset-0">
                <GenerateWords
                  words={words}
                  className="text-slate-500 font-mono text-xl md:text-2xl leading-relaxed whitespace-pre-wrap break-words select-none"
                />
                {!isFinished && (
                  <UserTypings
                    userInput={typed}
                    words={words}
                    className="absolute inset-0 text-white font-mono text-xl md:text-2xl leading-relaxed whitespace-pre-wrap break-words pointer-events-none"
                  />
                )}
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
                className={`flex flex-col gap-2 p-3 rounded-lg ${
                  p.progress >= 100
                    ? "bg-green-900/20 border border-green-500/30"
                    : "bg-[#121212]"
                }`}
              >
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.username}</span>
                    {p.progress >= 100 && (
                      <span className="text-xs bg-green-500 px-2 py-1 rounded">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span>{Math.floor(p.wpm)} WPM</span>
                    <span>•</span>
                    <span>{Math.floor(p.accuracy)}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      p.progress >= 100 ? "bg-green-500" : "bg-[#ef4444]"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.floor(p.progress))}%`,
                    }}
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
