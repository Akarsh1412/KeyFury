import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL, { autoConnect: false });

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      // console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      // console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
