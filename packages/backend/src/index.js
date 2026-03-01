import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { authMiddleware, verifyToken } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import conversationRoutes from './routes/conversations.js'
import aiRoutes from './routes/ai.js'
import vaultRoutes from './routes/vault.js'
import guardianRoutes from './routes/guardian.js'
import timecapsuleRoutes from './routes/timecapsule.js'
import familyRoutes from './routes/family.js'
import biographyRoutes from './routes/biography.js'
import estateRoutes from './routes/estate.js'
import cryptoRoutes from './routes/crypto.js'
import creatorRoutes from './routes/creator.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Rate limiting — apply globally to all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
})

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' }
})

app.use('/api/', apiLimiter)
app.use('/api/auth/', authLimiter)

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/afterme')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/vault', vaultRoutes)
app.use('/api/guardian', guardianRoutes)
app.use('/api/timecapsule', timecapsuleRoutes)
app.use('/api/family', familyRoutes)
app.use('/api/biography', biographyRoutes)
app.use('/api/estate', estateRoutes)
app.use('/api/crypto', cryptoRoutes)
app.use('/api/creator', creatorRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Socket.io authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  const decoded = verifyToken(token)

  if (!decoded) {
    return next(new Error('Authentication failed'))
  }

  socket.userId = decoded.userId
  next()
})

// Socket.io events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`)

  socket.on('message:sent', (data) => {
    io.to(data.conversationId).emit('message:received', data)
  })

  socket.on('typing:start', (data) => {
    io.to(data.conversationId).emit('typing:start', {
      userId: socket.userId,
      conversationId: data.conversationId
    })
  })

  socket.on('typing:stop', (data) => {
    io.to(data.conversationId).emit('typing:stop', {
      userId: socket.userId,
      conversationId: data.conversationId
    })
  })

  socket.on('read:receipt', (data) => {
    io.to(data.conversationId).emit('read:receipt', {
      userId: socket.userId,
      messageId: data.messageId
    })
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`)
    io.emit('user:offline', socket.userId)
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
