'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend:      (content: string) => void;
  onTyping:    (isTyping: boolean) => void;
  disabled?:   boolean;
}

export function MessageInput({ onSend, onTyping, disabled }: Props) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);

    // Emit typing=true immediately, then debounce typing=false after 2s of silence.
    // This prevents spamming the server with typing events on every keystroke.
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText('');
    onTyping(false);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }

  // Send on Enter, newline on Shift+Enter
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="flex items-end gap-3 p-4 border-t border-slate-100 bg-white">
      <textarea
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Connecting…' : 'Type a message… (Enter to send)'}
        maxLength={1000}
        className="flex-1 resize-none px-4 py-2.5 text-sm border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed max-h-32 overflow-y-auto"
        style={{
          // Auto-grow the textarea up to 4 lines, then scroll
          height: 'auto',
          minHeight: '42px',
        }}
        onInput={e => {
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
        }}
        aria-label="Message input"
      />

      {/* Send button — disabled when input is empty or socket is not connected */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        className="shrink-0 size-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all duration-150 cursor-pointer"
      >
        <Send className="size-4" />
      </button>
    </div>
  );
}
