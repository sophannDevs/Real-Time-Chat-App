'use client';

import { useEffect, useRef } from 'react';
import { Message, TypingUser } from '@/lib/api';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages:     Message[];
  currentUser:  { id: number; username: string };
  typingUsers:  TypingUser[];
}

export function ChatWindow({ messages, currentUser, typingUsers }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom whenever a new message arrives.
  // behavior: 'smooth' gives a nice glide effect.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Other users who are currently typing (exclude self)
  const othersTyping = typingUsers.filter(u => u.userId !== currentUser.id);

  // Format: "Alice is typing…" or "Alice and Bob are typing…"
  function typingLabel(): string {
    if (othersTyping.length === 0) return '';
    if (othersTyping.length === 1) return `${othersTyping[0].username} is typing…`;
    if (othersTyping.length === 2) return `${othersTyping[0].username} and ${othersTyping[1].username} are typing…`;
    return 'Several people are typing…';
  }

  return (
    // flex-1 makes this take all remaining vertical space in the layout
    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 scroll-touch">

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-16">
          <div className="text-4xl" aria-hidden="true">💬</div>
          <p className="text-slate-500 text-sm">No messages yet. Say hello!</p>
        </div>
      )}

      {/* Message list */}
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwnMessage={msg.user_id === currentUser.id}
        />
      ))}

      {/* Typing indicator */}
      {othersTyping.length > 0 && (
        <div className="flex items-center gap-2 animate-fade-in" aria-live="polite" aria-atomic="true">
          {/* Three bouncing dots */}
          <div className="flex gap-1 px-4 py-2.5 bg-slate-100 rounded-2xl rounded-bl-sm">
            {[0, 150, 300].map(delay => (
              <span
                key={delay}
                className="size-1.5 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">{typingLabel()}</span>
        </div>
      )}

      {/* Invisible anchor — scrolled into view on new messages */}
      <div ref={bottomRef} />
    </div>
  );
}
