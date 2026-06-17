'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, OnlineUser, TypingUser } from '@/lib/api';

const SERVER = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface UseSocketReturn {
  messages:    Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  connected:   boolean;
  sendMessage: (content: string) => void;
  setTyping:   (isTyping: boolean) => void;
}

// Custom hook that manages the Socket.IO connection for the chat.
//
// Why a custom hook?
//   - Keeps all socket logic in one place.
//   - The chat page just calls useSocket() and gets back data + actions.
//   - The socket is automatically cleaned up when the component unmounts.
//
// token: the JWT from localStorage — passed to the server for authentication.
export function useSocket(token: string | null): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);

  const [messages,    setMessages]    = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [connected,   setConnected]   = useState(false);

  useEffect(() => {
    if (!token) return; // Don't connect if there's no token

    // io() opens a WebSocket connection to our backend.
    // auth.token is sent in the handshake — the server's middleware verifies it.
    const socket = io(SERVER, {
      auth:              { token },
      transports:        ['websocket'], // Skip long-polling, go straight to WS
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // ── Connection lifecycle ────────────────────────────────────────────────
    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // ── Server events ───────────────────────────────────────────────────────

    // A new message was saved — the server broadcasts this to all clients.
    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Updated list of who is currently connected.
    socket.on('online_users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    // Another user started or stopped typing.
    socket.on('user_typing', (data: TypingUser) => {
      setTypingUsers(prev => {
        const without = prev.filter(u => u.userId !== data.userId);
        return data.isTyping ? [...without, data] : without;
      });
    });

    // Cleanup: disconnect socket when this component unmounts or token changes.
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // useCallback ensures these functions don't get re-created on every render,
  // which would cause any component using them to re-render unnecessarily.
  const sendMessage = useCallback((content: string) => {
    socketRef.current?.emit('send_message', { content });
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    socketRef.current?.emit('typing', isTyping);
  }, []);

  return { messages, setMessages, onlineUsers, typingUsers, connected, sendMessage, setTyping };
}
