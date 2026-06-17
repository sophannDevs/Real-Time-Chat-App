import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express's built-in Request type so TypeScript knows about req.user
export interface AuthRequest extends Request {
  user?: { id: number; username: string; email: string };
}

// This middleware runs before any protected route handler.
// It reads the JWT from the Authorization header, verifies it,
// and attaches the decoded user data to req.user.
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Expect: "Authorization: Bearer <token>"
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7); // Strip the "Bearer " prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      username: string;
      email: string;
    };
    req.user = decoded; // Attach user info — available to route handlers as req.user
    next();             // Continue to the actual route handler
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
