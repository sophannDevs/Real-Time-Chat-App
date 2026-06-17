import { OnlineUser } from '@/lib/api';

interface Props {
  users:         OnlineUser[];
  currentUserId: number;
}

function getInitials(username: string): string {
  return username.charAt(0).toUpperCase();
}

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

export function UserList({ users, currentUserId }: Props) {
  return (
    // Right sidebar panel
    <aside className="w-64 shrink-0 border-l border-slate-100 flex flex-col bg-white">

      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Online
        </h2>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">
          {users.length}
          <span className="text-sm font-normal text-slate-400 ml-1.5">
            {users.length === 1 ? 'person' : 'people'}
          </span>
        </p>
      </div>

      {/* User list */}
      <ul className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1" role="list" aria-label="Online users">
        {users.map(user => (
          <li
            key={user.id}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {/* Avatar with online indicator dot */}
            <div className="relative shrink-0">
              <div
                className={`size-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarColor(user.username)}`}
                aria-hidden="true"
              >
                {getInitials(user.username)}
              </div>
              {/* Green dot = online (always shown since this is the online users list) */}
              <span
                className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 border-2 border-white rounded-full"
                aria-hidden="true"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate">
                {user.username}
              </span>
              {user.id === currentUserId && (
                <span className="text-[10px] text-indigo-400 font-medium">You</span>
              )}
            </div>
          </li>
        ))}

        {users.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-slate-400">
            No one online yet
          </li>
        )}
      </ul>
    </aside>
  );
}
