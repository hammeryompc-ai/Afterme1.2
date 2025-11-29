# Getting Started with Afterme

## Quick Start (5 minutes)

### Option 1: Docker Compose (Recommended)

```bash

# Make sure Docker is running

# From project root
docker-compose up

# Wait for all services to start
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# AI Service: http://localhost:6000
```

### Option 2: Manual Setup

#### 1. S
tart MongoDB
```bash
# Using homebrew
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name afterme-mongodb mongo:6.0
```

#### 2. Start Backend
```bash
cd packages/backend

# Copy and edit .env
cp .env.example .env

# Install and start
npm install
npm run dev
# Runs on http://localhost:5000
```

#### 3. Start AI Service
```bash
cd packages/ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install and start
pip install -r requirements.txt
python src/main.py
# Runs on http://localhost:6000
```

#### 4. Start Frontend
```bash
cd packages/frontend

# Install and start
npm install
npm run dev
# Runs on http://localhost:3000
```

## First Time Usage

### Create Account
1. Go to http://localhost:3000
2. Click "Create One"
3. Fill in your details
4. You'll be logged in automatically

### Set Up Your Legacy Profile

1. Click your profile icon (top-right)
2. Go to "My Legacy Profile"
3. **Start Personality Training**:
   - Click "Start Personality Training"
   - Share 4+ stories or personality traits
   - Each submission increases training progress
   - Once at 100%, move to voice cloning

4. **Voice Cloning**:
   - Click "Record Voice Sample"
   - Record yourself for 10 seconds (up to 3 samples)
   - The AI will analyze your voice patterns

5. **Activate Legacy**:
   - Once 3 voice samples are recorded
   - Click "Activate Legacy Profile"
   - Your AI personality is now live!

### Start Chatting

1. Go back to Chat
2. Click the + button to start a new conversation
3. Search and select a user
4. Start messaging!

### View Someone's Legacy
1. If someone has a memorialized profile, you can access it
2. Go to their legacy profile link
3. Chat with their AI personality
4. Ask them questions - the AI will respond in their style

## Testing

### Create Test Accounts
```bash
# User 1
Email: alice@test.com
Password: password123
Name: Alice Johnson

# User 2
Email: bob@test.com
Password: password123
Name: Bob Smith
```

### Test Real-Time Features
- Open 2 browser windows with different accounts
- Send messages between accounts
- Watch typing indicators and read receipts work
- Check online status updates

### Test AI Features
- Go to Profile → My Legacy Profile
- Submit personality training data
- Record voice samples
- Activate legacy profile

## Troubleshooting

### Frontend won't connect to backend
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If not, start backend in packages/backend
npm run dev
```

### MongoDB connection error
```bash
# Check if MongoDB is running
mongosh

# If not:
# - With Docker: docker start afterme-mongodb
# - With Brew: brew services start mongodb-community
```

### Port already in use
```bash
# Find process using port (e.g., 3000)
lsof -i :3000

# Kill it (replace PID)
kill -9 <PID>
```

### Python dependencies issue
```bash
# Make sure virtual environment is activated
source packages/ai-service/venv/bin/activate

# Reinstall requirements
pip install --upgrade -r requirements.txt
```

## Development Tips

### Edit a file to see hot reload
- Frontend: Changes save instantly
- Backend: Restart needed (nodemon watches files)
- AI Service: Restart needed (run main.py)

### Database access
```bash
# Connect to MongoDB
mongosh afterme

# View users
db.users.find()

# View conversations
db.conversations.find()

# View messages
db.messages.find()
```

### API Testing
```bash
# Use curl or Postman

# Get conversations
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/conversations

# Create conversation
curl -X POST http://localhost:5000/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"participantIds":["USER_ID"]}'
```

## Performance Tips

1. **Frontend**:
   - Vite provides instant reload
   - Use browser DevTools to profile
   - Check Network tab for slow requests

2. **Backend**:
   - Monitor MongoDB indexes
   - Use caching for frequently accessed data
   - Profile with Node.js profiler

3. **AI Service**:
   - Models are cached after first load
   - GPU support recommended for faster processing
   - Use async/await properly

## Next Steps

- Explore the codebase in each package
- Read API documentation in main README
- Deploy to production (see deployment guide)
- Add features and improvements

---

Need help? Check the main README.md for more details!
