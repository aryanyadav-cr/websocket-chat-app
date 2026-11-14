
import { useState, useEffect, useRef } from 'react';
import api from './axios';

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [backendStatus, setBackendStatus] = useState('Checking backend...');
  const connection = useRef(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const { data } = await api.get('/api/health');
        setBackendStatus(data.message || 'Backend connected');
      } catch (error) {
        console.error(error);
        setBackendStatus('Backend unavailable');
      }
    };

    checkBackend();

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const ws = new WebSocket(wsUrl);

    connection.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'user_online' || data.type === 'user_offline') {
          setOnlineUsers((prev) => {
            const users = new Set(prev);

            if (Array.isArray(data.users)) {
              data.users.forEach(user => users.add(user));
            }

            if (data.type === 'user_offline' && data.username) {
              users.delete(data.username);
            }

            return [...users];
          });
          return;
        }

        if (data.type === 'message') {
          setMessages(prev => [
            ...prev,
            `${data.username}: ${data.message}`
          ]);
          return;
        }

        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }

      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    const value = message.trim();

    if (!value || connection.current?.readyState !== WebSocket.OPEN) return;

    connection.current.send(
      JSON.stringify({ type: 'message', message: value })
    );

    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="bg-indigo-600 p-5 flex justify-between items-center">
          <div>
            <h2 className="text-white text-2xl font-bold">
              WebSocket Chat
            </h2>
            <p className="text-indigo-100 text-sm">
              Real-time messaging
            </p>
          </div>

          <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm">
            Live Chat
          </span>
        </div>

        {/* Backend Status */}
        <div className="px-5 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Backend Status:

            <span className={`ml-2 font-semibold ${
              backendStatus === 'Backend unavailable'
                ? 'text-red-500'
                : backendStatus === 'Checking backend...'
                ? 'text-yellow-500'
                : 'text-green-600'
            }`}>
              {backendStatus}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">

          {/* Online Users */}
          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200">

            <h3 className="text-gray-800 font-semibold text-lg mb-4">
              Online Users ({onlineUsers.length})
            </h3>

            <ul className="space-y-3">
              {onlineUsers.map((user, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-gray-700 bg-gray-100 p-3 rounded-lg"
                >
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  {user}
                </li>
              ))}

              {onlineUsers.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No users online
                </p>
              )}
            </ul>

          </div>

          {/* Messages */}
          <div className="md:col-span-2 p-5">

            <h3 className="text-gray-800 font-semibold text-lg mb-4">
              Messages
            </h3>

            <div className="h-80 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3">

              {messages.length === 0 && (
                <p className="text-gray-400 text-center mt-28">
                  No messages yet. Start chatting!
                </p>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className="bg-indigo-600 text-white p-3 rounded-lg w-fit max-w-full break-words shadow-sm"
                >
                  {msg}
                </div>
              ))}

            </div>

            {/* Input */}
            <div className="flex gap-2">

              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 min-w-0 bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-gray-400"
              />

              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Send
              </button>

            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 text-center">
          <p className="text-gray-400 text-xs">
            WebSocket Real-Time Chat Application
          </p>
        </div>

      </div>
    </div>
  );
}

export default Chat;
