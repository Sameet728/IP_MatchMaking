import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Server as HttpServer } from 'http';
import { db } from './db';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
      const { rows } = await db.query('SELECT * FROM "User" WHERE id = $1', [decoded.id]);
      const user = rows[0];
      if (!user) return next(new Error('Authentication error: User not found'));

      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.data.user.id}`);
    
    // Join a personal room for direct notifications
    socket.join(socket.data.user.id);

    // Join organization room if applicable
    if (socket.data.user.organizationId) {
      socket.join(`org_${socket.data.user.organizationId}`);
    }

    socket.on('join_deal_room', (dealId: string) => {
      socket.join(`deal_${dealId}`);
      console.log(`User ${socket.data.user.id} joined deal room ${dealId}`);
    });

    socket.on('leave_deal_room', (dealId: string) => {
      socket.leave(`deal_${dealId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.data.user.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
