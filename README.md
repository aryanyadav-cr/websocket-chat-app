#Live link :wesocket-application.netlify.app

# WebSocket Chat Application

This project is a simple real-time chat app built with a Node.js WebSocket server, Redis pub/sub messaging, and a React frontend. It shows how messages can be broadcast to all connected clients instantly without reloading the page.

## Project overview

- Frontend: React + Vite app for the chat UI
- Backend: Node.js server using the `ws` library for WebSocket communication
- Messaging layer: Redis channel used for broadcasting events between connected clients
- Purpose: real-time online user updates and message sharing

## How it works

1. The frontend opens a WebSocket connection to the backend.
2. The backend creates a unique username for each client and tracks connected users.
3. When a message is sent, the backend publishes it to Redis.
4. The backend listens to the same Redis channel and broadcasts the message to all connected clients.
5. The UI shows live messages and online users in real time.

## Folder structure

- `backend/` - WebSocket server and Redis connection config
- `Frontend/` - React application for the chat user interface
- `index.html` - root page used by the backend when serving the app
- `README.md` - project overview and setup steps

## Technologies used

- React
- Vite
- Node.js
- WebSockets (`ws`)
- Redis
- Docker (for Redis container)

## Prerequisites

Before running the project, install:

- Node.js
- npm
- Docker Desktop (for Redis)

## Setup

### 1. Start Redis

From the backend folder:

```bash
cd backend
docker-compose up -d
```

This starts Redis on port `6379`.

### 2. Create a backend environment file

Inside the `backend` folder, create a `.env` file with:

```env
REDIS_URL=redis://localhost:6379
```

### 3. Run the backend

```bash
cd backend
node server.js
```

The backend listens on port `8080` by default.

### 4. Run the frontend

Open a second terminal and run:

```bash
cd Frontend
npm install
npm run dev
```

The Vite app usually runs on:

- http://localhost:5173

## Features

- Real-time messaging between clients
- Live online user list
- User join and user leave updates
- Backend health check endpoint at `/api/health`

## Notes

This project is a basic example of a real-time messaging system and is useful for learning:

- WebSockets
- Redis pub/sub
- full-duplex client-server communication
- frontend and backend integration

## Example flow

```text
Browser -> WebSocket -> Node.js server -> Redis -> other connected clients
```
