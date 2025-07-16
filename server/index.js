import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import configurations and utilities
import connectDB from './config/database.js';
import { logger } from './utils/logger.js';
import { corsOptions, helmetOptions, securityHeaders, sanitizeRequest } from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import jobRoutes from './routes/jobs.js';
import messageRoutes from './routes/messages.js';
import companyRoutes from './routes/companies.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(sanitizeRequest);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
app.use('/api/', generalLimiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.IO connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // User joins
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    socket.broadcast.emit('user-online', userId);
    logger.info(`User ${userId} joined with socket ${socket.id}`);
  });

  // Private messaging
  socket.on('send-message', async (data) => {
    try {
      const { senderId, receiverId, content, type = 'text' } = data;
      
      // Save message to database (implement in message service)
      const message = {
        sender: senderId,
        receiver: receiverId,
        content,
        type,
        timestamp: new Date()
      };

      // Send to receiver if online
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', message);
      }

      // Confirm to sender
      socket.emit('message-sent', { messageId: message._id, timestamp: message.timestamp });
      
    } catch (error) {
      logger.error('Socket message error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Typing indicators
  socket.on('typing-start', (data) => {
    const { receiverId, senderId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', { userId: senderId });
    }
  });

  socket.on('typing-stop', (data) => {
    const { receiverId, senderId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-stopped-typing', { userId: senderId });
    }
  });

  // Notifications
  socket.on('join-notifications', (userId) => {
    socket.join(`notifications-${userId}`);
  });

  // Video call signaling
  socket.on('call-user', (data) => {
    const { userToCall, signalData, from, name } = data;
    const userSocketId = activeUsers.get(userToCall);
    if (userSocketId) {
      io.to(userSocketId).emit('call-incoming', { signal: signalData, from, name });
    }
  });

  socket.on('answer-call', (data) => {
    const { to, signal } = data;
    const userSocketId = activeUsers.get(to);
    if (userSocketId) {
      io.to(userSocketId).emit('call-accepted', signal);
    }
  });

  socket.on('end-call', (data) => {
    const { to } = data;
    const userSocketId = activeUsers.get(to);
    if (userSocketId) {
      io.to(userSocketId).emit('call-ended');
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
    
    // Remove from active users
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        socket.broadcast.emit('user-offline', userId);
        break;
      }
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    import('mongoose').then(mongoose => {
      mongoose.connection.close(() => {
        logger.info('Database connection closed');
        process.exit(0);
      });
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

// Uncaught exception
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();