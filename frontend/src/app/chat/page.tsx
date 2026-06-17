'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { fetchMessages } from '@/lib/api';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { UserList } from '@/components/chat/UserList';

interface StoredUser {
  id:       number;
  username: string;
  email:    string;
}

export default function ChatPage() {
  const router = useRouter();

  // Read auth data from localStorage.
  // null while the component is mounting (we haven't run useEffect yet).
  const [token, setToken] = useState<string | null>(null);
  const [user,  setUser]  = useState<StoredUser | null>(null);

  // useEffect runs only in the browser (localStorage is not available server-side)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      // Not logged in — redirect to login page
      router.replace('/login');
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(storedUser));
  }, [router]);

  // Connect Socket.IO — this hook manages the real-time connection
  const {
    messages,
    setMessages,
    onlineUsers,
    typingUsers,
    connected,
    sendMessage,
    setTyping,
  } = useSocket(token);

  // When the socket connects, load chat history from the REST API.
  // We do this via HTTP (not socket) because it's a standard request/response.
  useEffect(() => {
    if (!token || !connected) return;

    fetchMessages(token).then(history => {
      setMessages(history);
    });
  }, [token, connected, setMessages]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  }

  // Show nothing while auth state is loading to avoid a flash
  if (!user) return null;

  return (
    // Full-screen layout: header + (sidebar | chat-area)
    <div className="flex flex-col h-dvh bg-white">

      {/* ── Top navigation bar ────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="size-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">ChatApp</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection status indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>
            {connected
              ? <><Wifi className="size-3.5" /> Live</>
              : <><WifiOff className="size-3.5" /> Connecting…</>
            }
          </div>

          {/* Logged-in user chip */}
          <div className="flex items-center gap-2 text-sm">
            <div className="size-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-slate-600 font-medium hidden sm:block">{user.username}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:block">Log out</span>
          </button>
        </div>
      </header>

      {/* ── Main content: sidebar + chat ────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chat area — grows to fill remaining space */}
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Room label */}
          <div className="px-6 py-3 border-b border-slate-50 shrink-0">
            <h1 className="text-sm font-semibold text-slate-700"># General</h1>
            <p className="text-xs text-slate-400">Global chat room</p>
          </div>

          {/* Message list — scrollable */}
          <ChatWindow
            messages={messages}
            currentUser={user}
            typingUsers={typingUsers}
          />

          {/* Message input — fixed at bottom */}
          <MessageInput
            onSend={sendMessage}
            onTyping={setTyping}
            disabled={!connected}
          />
        </main>

        {/* Online users sidebar */}
        <UserList
          users={onlineUsers}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
