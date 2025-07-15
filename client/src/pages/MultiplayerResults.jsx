import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/socketContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Target, Zap, ArrowLeft, LogOut } from "lucide-react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";

const API_URL = import.meta.env.VITE_BACKEND_URL;

function MultiplayerResults() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("wpm");
  const isGoingBackToRoom = useRef(false);

  // Fetch results on component mount
  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/results/${roomId}`);
        setResults(response.data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, roomId]);

  useEffect(() => {
    return () => {
      // Only leave room if not going back to room
      if (!isGoingBackToRoom.current && socket && user) {
        socket.emit("leaveRoom", { roomId, userId: user.uid });
      }
    };
  }, [socket, user, roomId]);

  // Handle browser tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && user && !isGoingBackToRoom.current) {
        socket.emit("leaveRoom", { roomId, userId: user.uid });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, user, roomId]);

  const handleBackToRoom = () => {
    isGoingBackToRoom.current = true;
    navigate(`/multiplayer/join/${roomId}`);
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit("leaveRoom", { roomId, userId: user?.uid });
    }
    navigate("/multiplayer");
  };

  if (loading) {
    return (
      <LoadingScreen
        message="Loading Results..."
        subtitle="Did You Finish First ?"
      />
    );
  }

  if (
    !loading &&
    (!results || !results.players || results.players.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">No results available</p>
          <button
            onClick={handleLeaveRoom}
            className="mt-4 px-6 py-2 bg-[#ef4444] hover:bg-[#dc2626] rounded-md transition"
          >
            Back to Multiplayer
          </button>
        </div>
      </div>
    );
  }

  const sortedPlayers = [...results.players].sort((a, b) => {
    if (a.finalWpm !== b.finalWpm) {
      return b.finalWpm - a.finalWpm;
    }
    return b.finalProgress - a.finalProgress;
  });

  const getChartData = () => {
    const allTimes = results.players.flatMap((p) =>
      p.performanceHistory.map((h) => h.time)
    );
    const maxTime = allTimes.length > 0 ? Math.max(...allTimes) : 0;

    const timePoints = [];
    for (let i = 0; i <= maxTime; i += 5) {
      timePoints.push(i);
    }

    return timePoints.map((time) => {
      const dataPoint = { time };

      results.players.forEach((player) => {
        let closestData = player.performanceHistory
          .slice()
          .reverse()
          .find((h) => h.time <= time);

        if (!closestData && player.performanceHistory.length > 0) {
          closestData = player.performanceHistory[0];
        }

        if (closestData) {
          dataPoint[`${player.username} Wpm`] = closestData.wpm;
          dataPoint[`${player.username} Progress`] = closestData.progress;
          dataPoint[`${player.username} Accuracy`] = closestData.accuracy;
        }
      });

      return dataPoint;
    });
  };

  const chartData = getChartData();
  const colors = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#f97316",
  ];

  const renderChart = () => {
    const metric = activeTab.toLowerCase();
    const yAxisLabel =
      metric === "wpm"
        ? "WPM"
        : metric === "progress"
        ? "Progress (%)"
        : "Accuracy (%)";

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            label={{
              value: "Time (seconds)",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            stroke="#9ca3af"
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
          />
          <Legend />
          {results.players.map((player, index) => (
            <Line
              key={player.userId}
              type="monotone"
              dataKey={`${player.username} ${
                metric === "wpm"
                  ? "Wpm"
                  : metric.charAt(0).toUpperCase() + metric.slice(1)
              }`}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{
                fill: colors[index % colors.length],
                strokeWidth: 2,
                r: 3,
              }}
              name={player.username}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <Trophy className="w-8 h-8 text-[#ef4444]" />
            <h1 className="text-3xl font-bold">Test Results</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBackToRoom}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#374151] border border-gray-600 rounded-md transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Room
            </button>
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] rounded-md transition"
            >
              <LogOut className="w-4 h-4" />
              Leave Room
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Final Rankings</h2>
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-700 overflow-hidden">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.userId}
                  className={`p-4 border-b border-gray-700 last:border-b-0 ${
                    player.userId === user?.uid ? "bg-[#ef4444]/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-black"
                            : index === 1
                            ? "bg-gray-400 text-black"
                            : index === 2
                            ? "bg-amber-600 text-black"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{player.username}</div>
                        <div className="text-sm text-gray-400">
                          {player.finished
                            ? `Finished in ${player.finishTime}s`
                            : "Did not finish"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-[#ef4444]" />
                          <span>{Math.floor(player.finalWpm)} WPM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-green-500" />
                          <span>{Math.floor(player.finalAccuracy)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Stats Card */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Performance</h2>
            {results.players
              .filter((p) => p.userId === user?.uid)
              .map((player) => (
                <div
                  key={player.userId}
                  className="bg-[#1a1a1a] rounded-xl border border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold">
                      {player.username}
                    </div>
                    <div className="bg-[#ef4444] text-white text-sm px-3 py-1 rounded-full">
                      #
                      {sortedPlayers.findIndex((p) => p.userId === user?.uid) +
                        1}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#121212] p-4 rounded-lg">
                      <div className="text-gray-400 text-sm">WPM</div>
                      <div className="text-2xl font-bold">
                        {Math.floor(player.finalWpm)}
                      </div>
                    </div>
                    <div className="bg-[#121212] p-4 rounded-lg">
                      <div className="text-gray-400 text-sm">Accuracy</div>
                      <div className="text-2xl font-bold">
                        {Math.floor(player.finalAccuracy)}%
                      </div>
                    </div>
                    <div className="bg-[#121212] p-4 rounded-lg">
                      <div className="text-gray-400 text-sm">Progress</div>
                      <div className="text-2xl font-bold">
                        {Math.floor(player.finalProgress)}%
                      </div>
                    </div>
                    <div className="bg-[#121212] p-4 rounded-lg">
                      <div className="text-gray-400 text-sm">Time</div>
                      <div className="text-2xl font-bold">
                        {player.finished ? `${player.finishTime}s` : "DNF"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Performance Charts */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-700 p-6">
          <h2 className="text-2xl font-bold mb-4">Performance Comparison</h2>

          <div className="flex border-b border-gray-700 mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "wpm"
                  ? "text-[#ef4444] border-b-2 border-[#ef4444]"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("wpm")}
            >
              Words Per Minute
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "progress"
                  ? "text-[#ef4444] border-b-2 border-[#ef4444]"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("progress")}
            >
              Progress
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "accuracy"
                  ? "text-[#ef4444] border-b-2 border-[#ef4444]"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("accuracy")}
            >
              Accuracy
            </button>
          </div>

          <div className="h-[400px]">{renderChart()}</div>
        </div>
      </div>
    </div>
  );
}

export default MultiplayerResults;
