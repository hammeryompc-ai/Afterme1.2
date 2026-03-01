import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { authMiddleware, verifyToken } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import conversationRoutes from './routes/conversations.js'
import aiRoutes from './routes/ai.js'
import conciergeRoutes from './routes/concierge.js'
import guardianRoutes from './routes/guardian.js'
import kidsRoutes from './routes/kids.js'
import familyRoutes from './routes/family.js'
import biographerRoutes from './routes/biographer.js'
import bankingRoutes from './routes/banking.js'
import cryptoRoutes from './routes/crypto.js'
import creatorRoutes from './routes/creator.js'
import tenantRoutes from './routes/tenant.js'
import executorRoutes from './routes/executor.js'

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/afterme')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/concierge', conciergeRoutes)
app.use('/api/guardian', guardianRoutes)
app.use('/api/kids', kidsRoutes)
app.use('/api/family', familyRoutes)
app.use('/api/biographer', biographerRoutes)
app.use('/api/banking', bankingRoutes)
app.use('/api/crypto', cryptoRoutes)
app.use('/api/creator', creatorRoutes)
app.use('/api/tenant', tenantRoutes)
app.use('/api/executor', executorRoutes)

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
