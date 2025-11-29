# 🚀 Afterme 1.2 - Quick Reference Guide

## Fastest Way to Get Started

### 1️⃣ Docker (Easiest - 30 seconds)
```bash
cd /workspaces/Afterme1.2
docker-compose up
# Visit http://localhost:3000
```

### 2️⃣ Manual (3 Terminals)
```bash
# Terminal 1: Backend
cd /workspaces/Afterme1.2/packages/backend
npm install
npm run dev

# Terminal 2: Frontend  
cd /workspaces/Afterme1.2/packages/frontend
npm install
npm run dev

# Terminal 3: AI Service
cd /workspaces/Afterme1.2/packages/ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

## Services & Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 5000 | http://localhost:5000 |
| AI Service | 6000 | http://localhost:6000 |
| MongoDB | 27017 | mongodb://localhost:27017 |

## Test Account

```
Email: test@example.com
Password: password123
```

## Key Files

### Frontend
- `packages/frontend/src/pages/ChatPage.jsx` - Main chat interface
- `packages/frontend/src/pages/ProfilePage.jsx` - AI training setup
- `packages/frontend/src/pages/LegacyProfilePage.jsx` - Memorial profiles
- `packages/frontend/src/services/socket.js` - Real-time communication
- `packages/frontend/src/store/` - State management

### Backend
- `packages/backend/src/index.js` - Server entry point
- `packages/backend/src/routes/conversations.js` - Chat API
- `packages/backend/src/routes/ai.js` - AI API endpoints
- `packages/backend/src/models/User.js` - User schema with AI fields

### AI Service
- `packages/ai-service/src/main.py` - Flask server with ML models

## Main Features

### 💬 Real-Time Messaging
- Send/receive messages instantly
- See typing indicators
- Read receipts
- Online status

### 🧠 AI Personality Training
1. Submit 4 personality traits/stories
2. Progress: 0% → 25% → 50% → 75% → 100%
3. Ready for voice cloning

### 🎤 Voice Cloning
1. Record 3 voice samples (10 sec each)
2. AI analyzes your voice
3. Can synthesize responses in your voice

### 🕊️ Legacy Profile
1. After training complete, activate memorial
2. Friends can chat with your AI
3. AI responds based on your personality

## API Endpoints Quick Reference

### Auth
```
POST /api/auth/signup { email, password, firstName, lastName }
POST /api/auth/login { email, password }
GET  /api/auth/profile [Bearer token]
```

### Chat
```
GET  /api/conversations [Bearer token]
POST /api/conversations { participantIds } [Bearer token]
GET  /api/conversations/:id/messages [Bearer token]
POST /api/conversations/:id/messages { content, type } [Bearer token]
PUT  /api/conversations/:id/read [Bearer token]
```

### AI
```
POST /api/ai/personality/start [Bearer token]
POST /api/ai/personality/train { dataPoints } [Bearer token]
POST /api/ai/voice/upload { audio } [Bearer token]
POST /api/ai/memorialization/activate [Bearer token]
POST /api/ai/legacy/chat { userId, message }
```

## Frontend State (Zustand)

### Auth Store
```javascript
useAuthStore((state) => ({
  token,
  user,
  setToken,
  setUser,
  logout
}))
```

### Chat Store
```javascript
useChatStore((state) => ({
  conversations,
  currentConversation,
  messages,
  typingUsers,
  onlineUsers,
  setConversations,
  addMessage,
  // ...
}))
```

### AI Store
```javascript
useAIStore((state) => ({
  personalityProfile,
  voiceClone,
  trainingProgress,
  isMemorialized,
  setPersonalityProfile,
  setTrainingProgress,
  setIsMemorialized
}))
```

## Socket Events

### Listening
```javascript
socket.on('message:received', (data) => {})
socket.on('typing:start', (data) => {})
socket.on('typing:stop', (data) => {})
socket.on('user:online', (userId) => {})
socket.on('user:offline', (userId) => {})
socket.on('read:receipt', (data) => {})
```

### Emitting
```javascript
socket.emit('message:sent', { conversationId, message })
socket.emit('typing:start', { conversationId })
socket.emit('typing:stop', { conversationId })
```

## File Structure Overview

```
Afterme1.2/
├── README.md                    # Full docs
├── GETTING_STARTED.md           # Quick start
├── IMPLEMENTATION_GUIDE.md      # Details
├── ARCHITECTURE.md              # Diagrams
├── COMPLETION_CHECKLIST.md      # What's done
├── PROJECT_SUMMARY.txt          # Summary
├── docker-compose.yml           # Docker setup
├── package.json                 # Monorepo
│
└── packages/
    ├── frontend/                # React app
    │   ├── src/
    │   │   ├── pages/          # ChatPage, ProfilePage, etc.
    │   │   ├── services/       # api.js, socket.js
    │   │   └── store/          # Zustand stores
    │   └── vite.config.js
    │
    ├── backend/                # Node.js server
    │   ├── src/
    │   │   ├── routes/         # API endpoints
    │   │   ├── models/         # MongoDB models
    │   │   └── index.js        # Main server
    │   └── package.json
    │
    └── ai-service/             # Python AI
        ├── src/main.py
        └── requirements.txt
```

## Common Tasks

### Add a New Route
```javascript
// routes/newFeature.js
router.get('/endpoint', authMiddleware, async (req, res) => {
  // implementation
})

// Add to backend/src/index.js
app.use('/api/newfeature', newFeatureRoutes)
```

### Add a New Component
```javascript
// Create in pages/ or components/
export default function MyComponent() {
  return <div>Component</div>
}

// Add to App.jsx routing
<Route path="/path" element={<MyComponent />} />
```

### Listen to Real-Time Event
```javascript
const socket = getSocket()
socket.on('event-name', (data) => {
  // Handle event
})
```

### Call API with Token
```javascript
const response = await api.get('/endpoint')  // Token auto-injected
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/afterme
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:6000
```

### Frontend
No .env needed - uses API proxy in vite.config.js

### AI Service
No .env needed - uses environment defaults

## Troubleshooting

### Port in use?
```bash
lsof -i :3000
kill -9 <PID>
```

### MongoDB not running?
```bash
# Docker
docker run -d -p 27017:27017 mongo:6.0

# Or with Brew
brew services start mongodb-community
```

### Can't connect to API?
1. Check backend is running: http://localhost:5000/api/health
2. Check CORS is enabled in backend
3. Check frontend proxy in vite.config.js

### Python issues?
```bash
# Activate virtual environment
source packages/ai-service/venv/bin/activate

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

## Documentation Map

| Document | Purpose |
|----------|---------|
| README.md | Complete documentation |
| GETTING_STARTED.md | Quick setup & testing |
| IMPLEMENTATION_GUIDE.md | Detailed features |
| ARCHITECTURE.md | System design |
| COMPLETION_CHECKLIST.md | What's implemented |
| PROJECT_SUMMARY.txt | Quick overview |
| This file | Quick reference |

## Next Steps

1. ✅ Start the application
2. ✅ Create a test account
3. ✅ Set up personality training
4. ✅ Record voice samples
5. ✅ Activate legacy profile
6. ✅ Invite another user
7. ✅ Start chatting
8. ✅ Deploy to production

## Resources

- Node.js docs: https://nodejs.org/docs/
- React docs: https://react.dev/
- MongoDB docs: https://docs.mongodb.com/
- Express docs: https://expressjs.com/
- Socket.io docs: https://socket.io/docs/
- Python docs: https://docs.python.org/

## Contact & Support

- Check README.md for detailed docs
- Look at code comments for guidance
- Review examples in each service
- Check browser console for errors

---

**You're all set! Happy coding!** 🚀

**Afterme**: Where Memories Never Die 🕊️
