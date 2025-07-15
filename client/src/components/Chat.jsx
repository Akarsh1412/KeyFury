import { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/helpers';
import { toast } from 'react-toastify';

function Chat({ socket, roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);

  const MAX_MESSAGE_LENGTH = 200;

  // Listen for chat messages
  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    const handleChatHistory = (history) => {
      setMessages(history);
    };

    socket.on('chatMessage', handleChatMessage);
    socket.on('chatHistory', handleChatHistory);

    return () => {
      socket.off('chatMessage', handleChatMessage);
      socket.off('chatHistory', handleChatHistory);
    };
  }, [socket]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    isAtBottomRef.current = isNearBottom;
  };

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    if (isAtBottomRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !user || !socket) return;

    const trimmedMessage = messageInput.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message too long! Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
      return;
    }

    socket.emit('chatMessage', {
      roomId,
      userId: user.uid,
      message: trimmedMessage
    });

    setMessageInput('');
    isAtBottomRef.current = true;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessageInput(value);
    }
  };

  const remainingChars = MAX_MESSAGE_LENGTH - messageInput.length;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto mb-2 bg-[#181818] rounded-t-md p-3 custom-scrollbar min-h-0"
        style={{ maxHeight: '100%' }}
      >
        {messages.length === 0 ? (
          <p className="text-slate-400 italic text-center py-8">No messages yet. Be the first to say something!</p>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={`${msg.userId}-${msg.timestamp}-${index}`} 
              className={`mb-3 ${msg.userId === user?.uid ? 'text-right' : ''}`}
            >
              {msg.userId !== user?.uid && (
                <div className="text-xs font-medium text-[#ef4444]">
                  {msg.username}
                </div>
              )}
              <div 
                className={`inline-block max-w-[80%] rounded-lg px-3 py-2 mt-1 ${
                  msg.userId === user?.uid 
                    ? 'bg-[#d32f2f] text-white' 
                    : 'bg-[#1f1f1f] text-white'
                }`}
                style={{ 
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}
              >
                <div>{msg.message}</div>
                <div className={`text-xs mt-1 ${msg.userId === user?.uid ? 'text-red-200' : 'text-gray-400'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex flex-col">
        <div className="text-xs text-gray-400 mb-1 text-right">
          {remainingChars} characters remaining
        </div>
        
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-[#1f1f1f] text-white px-3 py-2 rounded-bl-md border-t border-l border-b border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#ef4444]"
            aria-label="Type your message"
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <button
            type="submit"
            className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white px-4 py-2 rounded-br-md transition disabled:opacity-50"
            disabled={!messageInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
      
      {/* Scrollbar styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
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
};

export default Chat;