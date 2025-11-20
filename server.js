require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const socket = require('./utils/socket');
const { apiLimiter } = require('./middleware/RateLimiter');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB with optional in-memory fallback
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    if (String(process.env.USE_MEMORY_DB).toLowerCase() === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      global.__MONGOD = mongod;
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Connected to in-memory MongoDB');
    } else {
      process.exit(1);
    }
  }
};

connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting
app.use('/api/', apiLimiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport');

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to EventHub API!',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Multer error handling
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ msg: err.message });
  }
  
  res.status(err.status || 500).json({ 
    msg: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize Socket.IO
socket.init(server);
const io = socket.getIo();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins their personal notification room
  socket.on('joinUser', (userId) => {
    if (!userId) return;
    socket.join(userId.toString());
    console.log(`Socket ${socket.id} joined user room: ${userId}`);
  });

  socket.on('leaveUser', (userId) => {
    if (!userId) return;
    socket.leave(userId.toString());
    console.log(`Socket ${socket.id} left user room: ${userId}`);
  });

  // Join event room for chat
  socket.on('joinEvent', (eventId) => {
    if (!eventId) return;
    socket.join(`event-${eventId}`);
    console.log(`Socket ${socket.id} joined event-${eventId}`);
  });

  // Leave event room
  socket.on('leaveEvent', (eventId) => {
    if (!eventId) return;
    socket.leave(`event-${eventId}`);
    console.log(`Socket ${socket.id} left event-${eventId}`);
  });

  // Handle typing indicator
  socket.on('typing', ({ eventId, username }) => {
    socket.to(`event-${eventId}`).emit('userTyping', { username });
  });

  socket.on('stopTyping', ({ eventId }) => {
    socket.to(`event-${eventId}`).emit('userStoppedTyping');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});