import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

// Augment Socket to carry our user info after authentication
interface AuthSocket extends Socket {
  user?: { id: number; username: string; email: string };
}

// userId → { username, socketId }
// This map lets us broadcast the online-user list and detect disconnects.
const onlineUsers = new Map<number, { username: string; socketId: string }>();

function broadcastOnlineUsers(io: Server) {
  const users = Array.from(onlineUsers.entries()).map(([id, data]) => ({
    id,
    username: data.username,
  }));
  io.emit('online_users', users);
}

export function setupSocketIO(io: Server) {
  // ── Authentication middleware ─────────────────────────────────────────────
  // Runs once per connection attempt — before any event handlers fire.
  // The client must pass its JWT in socket.handshake.auth.token.
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: number;
        username: string;
        email: string;
      };
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket: AuthSocket) => {
    const user = socket.user!;
    console.log(`🟢 Connected: ${user.username} (${socket.id})`);

    // Mark this user online and tell everyone
    onlineUsers.set(user.id, { username: user.username, socketId: socket.id });
    broadcastOnlineUsers(io);

    // ── Event: send_message ─────────────────────────────────────────────────
    // Client emits this when the user clicks Send.
    // We save it to the DB, then broadcast 'new_message' to ALL clients.
    socket.on('send_message', async (data: { content: string }) => {
      const content = data?.content?.trim();

      if (!content || content.length > 1000) return; // Silently ignore invalid payloads

      try {
        const result = await pool.query(
          `INSERT INTO messages (user_id, content)
           VALUES ($1, $2)
           RETURNING id, content, created_at`,
          [user.id, content]
        );

        const msg = result.rows[0];

        // io.emit = everyone, socket.emit = only sender, socket.broadcast.emit = everyone except sender
        io.emit('new_message', {
          id:         msg.id,
          content:    msg.content,
          created_at: msg.created_at,
          user_id:    user.id,
          username:   user.username,
        });
      } catch (err) {
        console.error('Save message error:', err);
        socket.emit('error', { message: 'Failed to send message, please try again' });
      }
    });

    // ── Event: typing ───────────────────────────────────────────────────────
    // Client emits true when starting to type, false when stopping.
    // We relay this to everyone else so they can show "Alice is typing…"
    socket.on('typing', (isTyping: boolean) => {
      socket.broadcast.emit('user_typing', {
        userId:   user.id,
        username: user.username,
        isTyping,
      });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔴 Disconnected: ${user.username}`);
      onlineUsers.delete(user.id);
      broadcastOnlineUsers(io);
    });
  });
}
