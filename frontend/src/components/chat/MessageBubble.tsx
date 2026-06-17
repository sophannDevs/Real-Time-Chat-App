import { Message } from '@/lib/api';

interface Props {
  message:       Message;
  isOwnMessage:  boolean; // true when this message was sent by the current user
}

// Formats "2024-01-15T09:30:00Z" → "9:30 AM"
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit',
  });
}

// Returns initials for the avatar, e.g. "alice" → "A"
function getInitials(username: string): string {
  return username.charAt(0).toUpperCase();
}

// Deterministic color per user based on their username.
// This means Alice always gets the same avatar color, even after a refresh.
const AVATAR_COLORS = [
  'bg-violet-500', 'bg-pink-500', 'bg-amber-500',
  'bg-emerald-500', 'bg-cyan-500', 'bg-rose-500',
  'bg-teal-500',   'bg-orange-500',
];

function avatarColor(username: string): string {
  let hash = 0;
  for (const char of username) hash += char.charCodeAt(0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function MessageBubble({ message, isOwnMessage }: Props) {
  return (
    // animate-message-in = slide up + fade (defined in tailwind.config.ts)
    <div className={`flex items-end gap-2 animate-message-in ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar — hidden for own messages */}
      {!isOwnMessage && (
        <div
          aria-hidden="true"
          className={`shrink-0 size-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor(message.username)}`}
        >
          {getInitials(message.username)}
        </div>
      )}

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Username — only shown for other users' messages */}
        {!isOwnMessage && (
          <span className="text-xs font-medium text-slate-500 px-1">
            {message.username}
          </span>
        )}

        {/* Message text */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isOwnMessage
              ? 'bg-indigo-600 text-white rounded-br-sm'   // Sent: indigo, right-aligned, cut corner
              : 'bg-slate-100 text-slate-900 rounded-bl-sm' // Received: light gray, left-aligned
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
