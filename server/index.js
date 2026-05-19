const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimit');

// Routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const noteRoutes = require('./routes/notes');
const taskRoutes = require('./routes/tasks');
const eventRoutes = require('./routes/events');
const bookmarkRoutes = require('./routes/bookmarks');
const contactRoutes = require('./routes/contacts');
const meetingRoutes = require('./routes/meetings');
const musicRoutes = require('./routes/music');
const profileRoutes = require('./routes/profile');
const driveRoutes = require('./routes/drive');
const newsRoutes = require('./routes/news');
const microLearningRoutes = require('./routes/microLearning');
const spotSyncRoutes = require('./routes/spotsync');
const activityLogRoutes = require('./routes/activityLog');
const aiRoutes = require('./routes/ai');
const seedRoutes = require('./routes/seed');

// Socket handlers
const chatSocket = require('./sockets/chat');
const meetingsSocket = require('./sockets/meetings');
const musicSocket = require('./sockets/music');
const youtubeSocket = require('./sockets/youtube');
const spotsyncSocket = require('./sockets/spotsync');

// Services
const reminderService = require('./services/reminderService');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Auth middleware for socket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hellow_secret_key_2026');
    socket.userId = decoded._id;
    socket.join(decoded._id.toString());
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  chatSocket(io, socket);
  meetingsSocket(io, socket);
  musicSocket(io, socket);
  youtubeSocket(io, socket);
  spotsyncSocket(io, socket);
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(rateLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', authMiddleware, roomRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/notes', authMiddleware, noteRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/events', authMiddleware, eventRoutes);
app.use('/api/bookmarks', authMiddleware, bookmarkRoutes);
app.use('/api/contacts', authMiddleware, contactRoutes);
app.use('/api/meetings', authMiddleware, meetingRoutes);
app.use('/api/music', authMiddleware, musicRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/drive', authMiddleware, driveRoutes);
app.use('/api/news', authMiddleware, newsRoutes);
app.use('/api/micro-learning', authMiddleware, microLearningRoutes);
app.use('/api/spotsync', authMiddleware, spotSyncRoutes);
app.use('/api/activity-log', authMiddleware, activityLogRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api', seedRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler
app.use(errorHandler);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hellow';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start cron
reminderService.startCron();

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Hellow server running on port ${PORT}`);
});
