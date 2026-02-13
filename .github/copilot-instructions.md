# Copilot Instructions for Afterme 1.2

## Project Overview

Afterme is a premium digital legacy and AI personality platform. It combines real-time messaging (similar to Facebook Messenger) with AI personality cloning. Users can train an AI model on their communication style, voice patterns, and personality traits. When memorialized, friends can interact with the AI version of a loved one.

This is a **monorepo** managed with npm workspaces, containing three services:

- **Frontend** (`packages/frontend`): React 18 + Vite SPA with Tailwind CSS
- **Backend** (`packages/backend`): Node.js + Express REST API with Socket.io
- **AI Service** (`packages/ai-service`): Python Flask service with PyTorch/Transformers

## Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | React 18, Vite 5, Tailwind CSS 3.4, Zustand, Socket.io Client |
| Backend     | Node.js 18, Express 4, Socket.io, Mongoose 8, JWT   |
| AI Service  | Python 3.11, Flask 3.0, PyTorch 2.1, Transformers 4.35, Librosa |
| Database    | MongoDB 6.0                                          |
| Containers  | Docker, Docker Compose                               |

## Build & Test Commands

```bash
# Install all dependencies (monorepo)
npm run install-all

# Run all services concurrently (development)
npm run dev

# Build frontend and backend for production
npm run build

# Run with Docker (recommended for deployment)
docker-compose up

# Lint frontend
npm run lint --workspace=packages/frontend

# Lint backend
npm run lint --workspace=packages/backend
```

## Code Style & Conventions

- **JavaScript/JSX**: ES modules (`"type": "module"`), functional React components, arrow functions preferred
- **State management**: Zustand stores in `packages/frontend/src/store/`
- **API calls**: Use the Axios client in `packages/frontend/src/services/api.js` (auto-injects JWT tokens)
- **Real-time events**: Use Socket.io via `packages/frontend/src/services/socket.js`
- **Backend routes**: Express routers in `packages/backend/src/routes/`, protected with JWT auth middleware
- **Database models**: Mongoose schemas in `packages/backend/src/models/`
- **AI endpoints**: Flask routes in `packages/ai-service/src/main.py`
- **Styling**: Tailwind CSS utility classes; avoid custom CSS unless necessary

## Project Structure

```
Afterme1.2/
├── packages/
│   ├── frontend/           # React + Vite app (port 3000)
│   │   ├── src/
│   │   │   ├── pages/      # Page components (LoginPage, ChatPage, ProfilePage, etc.)
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── services/   # API client (api.js) and Socket.io (socket.js)
│   │   │   └── store/      # Zustand stores (authStore, chatStore, aiStore)
│   │   ├── Dockerfile
│   │   └── vite.config.js
│   ├── backend/            # Node.js + Express API (port 5000)
│   │   ├── src/
│   │   │   ├── index.js    # Server entry point with Socket.io
│   │   │   ├── routes/     # Express routes (auth, users, conversations, ai)
│   │   │   ├── models/     # Mongoose models (User, Conversation, Message, AITrainingData)
│   │   │   └── middleware/ # Auth middleware (JWT verification)
│   │   └── Dockerfile
│   └── ai-service/         # Python Flask ML service (port 6000)
│       ├── src/main.py     # Flask app with ML endpoints
│       ├── requirements.txt
│       └── Dockerfile
├── docker-compose.yml      # Multi-container orchestration
├── package.json            # Monorepo root (npm workspaces)
└── .env                    # Environment variables (dev only)
```

## Deployment

- All services are containerized with Docker and orchestrated via `docker-compose.yml`
- The frontend builds to static files served by Nginx in production
- The backend runs as a Node.js process
- The AI service runs as a Python Flask process
- MongoDB runs as a separate container with a persistent volume
- All versions are kept in sync at the same semver version across all `package.json` files

## Boundaries & Restrictions

- Never commit secrets or credentials to source code
- Do not modify `.env` with real secrets — use `.env.example` as a template
- Keep all three package versions (`packages/*/package.json`) in sync with the root `package.json` version
- This is a proprietary project — see `CONTRIBUTING.md` and `LICENSE` for terms
- Respect the existing monorepo workspace structure when adding dependencies
