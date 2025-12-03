# Afterme 1.2 - Digital Legacy & AI Personality Platform

## Overview

Afterme is a premium messaging platform with Facebook Messenger-level quality, combined with cutting-edge AI technology that allows users to create a digital legacy. When users pass away, their AI personality clone continues to exist, learning from their communication style, voice patterns, and personality traits to interact with loved ones.

## 🎯 Key Features

### 💬 Messaging (Facebook Messenger Quality)
- **Real-time Chat**: WebSocket-based instant messaging with real-time delivery
- **Read Receipts**: Know when your messages have been read
- **Typing Indicators**: See when someone is typing
- **Online Status**: Live presence indicators
- **Message History**: Complete chat history with search
- **Multiple Conversation Types**: 1-on-1 and group chats
- **Rich Media Support**: Images, voice messages, videos

### 🧠 AI Personality Cloning
- **Personality Training**: AI learns your personality traits, values, and communication style from text samples
- **Voice Cloning**: Create a voice clone through audio samples
- **Legacy Profile**: Your AI remains accessible to friends and family after you pass
- **Contextual Responses**: AI responds based on learned personality
- **Voice Synthesis**: AI speaks in your cloned voice

### 🕊️ Legacy Features
- **Memorialization**: Mark profiles as memorial/legacy
- **Access Control**: Choose who can interact with your legacy
- **Privacy Settings**: Control visibility and interaction permissions
- **Eternal Memory**: Your digital presence lives on
- **Legacy Chat**: Friends can chat with your AI personality

## 🛠 Tech Stack

### Frontend
- React 18, Vite, Tailwind CSS
- Socket.io Client, Zustand, Framer Motion
- Real-time communication with beautiful UI

### Backend
- Node.js & Express, Socket.io, MongoDB
- JWT authentication, Bcrypt, REST API
- Secure and scalable architecture

### AI Service
- Python Flask, PyTorch, Transformers
- Voice processing with Librosa
- Personality analysis and response generation

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

**Environment Setup:** The backend service loads secrets from a `.env` file in the repo root. A default `.env` is provided for local development with a placeholder `JWT_SECRET`. You can customize it as needed.

```bash
# Validate configuration before starting
docker compose -f docker-compose.yml config

# Start all services
docker compose up
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- AI Service: http://localhost:6000

### Option 2: Manual Setup
```bash
# Install all dependencies
npm run install-all

# Terminal 1: Backend
cd packages/backend && cp .env.example .env && npm run dev

# Terminal 2: Frontend
cd packages/frontend && npm run dev

# Terminal 3: AI Service
cd packages/ai-service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python src/main.py
```

## 📁 Project Structure

```
afterme/
├── packages/
│   ├── frontend/          # React + Vite
│   ├── backend/           # Node.js + Express
│   └── ai-service/        # Python + Flask
├── docker-compose.yml
├── README.md
└── GETTING_STARTED.md
```

## 💾 Database Models

- **User**: Authentication, AI profiles, privacy settings
- **Conversation**: Chat channels with participants
- **Message**: Individual messages with read receipts
- **AITrainingData**: Personality and voice training samples

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- CORS and socket authentication
- Privacy controls for legacy profiles

## 📚 API Overview

### Auth: `/api/auth`
- `POST /signup` - Create account
- `POST /login` - Login
- `GET /profile` - Get user profile

### Chat: `/api/conversations`
- `GET /` - List conversations
- `POST /` - Create conversation
- `GET /:id/messages` - Get messages
- `POST /:id/messages` - Send message

### AI: `/api/ai`
- `POST /personality/start` - Start training
- `POST /personality/train` - Submit training data
- `POST /voice/upload` - Upload voice sample
- `POST /memorialization/activate` - Activate legacy profile
- `POST /legacy/chat` - Chat with legacy AI

## 🎮 How to Use

1. **Sign up** with email and password
2. **Create your legacy profile**:
   - Share 4+ personality stories
   - Record 3 voice samples (10 seconds each)
   - Activate your memorial profile
3. **Start chatting** - Add friends and message in real-time
4. **Visit legacy profiles** - Chat with AI clones of memorialized friends

## 🚀 Deployment

- **Frontend**: Vercel, Netlify, or any static host
- **Backend**: Heroku, Railway, AWS, or any Node.js host
- **AI Service**: Docker container on AWS, Google Cloud, or similar
- **Database**: MongoDB Atlas for cloud hosting

## 📦 Features Breakdown

- ✅ Real-time messaging with WebSocket
- ✅ AI personality training system
- ✅ Voice cloning and synthesis
- ✅ Legacy profile memorialization
- ✅ Privacy and access controls
- ✅ User authentication and authorization
- ✅ Read receipts and typing indicators
- ✅ Online status tracking

## 🎯 Future Enhancements

- Advanced voice cloning models
- Multi-language support
- Video messaging and calls
- Mobile app (React Native)
- Advanced analytics
- Premium subscription tier

## 📖 Documentation

See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed setup instructions.

## 📝 License

Proprietary - Afterme Platform

## 💬 Support

- GitHub Issues
- Email: support@afterme.app

---

**Afterme**: Where Memories Never Die 🕊️
