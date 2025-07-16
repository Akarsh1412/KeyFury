# KeyFury ⚡

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFA611?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.2-010101?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**KeyFury** is a real-time multiplayer typing game where players compete in typing challenges. Join rooms, chat with competitors, and test your typing speed against others with live statistics and post-game analytics. Also features a clean, distraction-free single-player mode.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Here-brightgreen?style=for-the-badge)](https://key-fury.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-View_Source-blue?style=for-the-badge&logo=github)](https://github.com/Akarsh1412/KeyFury)

![KeyFury Demo](https://raw.githubusercontent.com/Akarsh1412/KeyFury/main/client/public/keyfury.gif)

## ✨ Features

- **🎮 Multiplayer Mode**: Create private rooms or join existing ones using a unique Room ID
- **🏆 Single Player Mode**: Practice with configurable time limits (15/30/45/60 seconds)
- **⚡ Real-time Competition**: Live WPM, accuracy, and progress tracking
- **⏱️ Synchronized Gameplay**: Server-managed countdown for fair starts
- **💬 Live In-Game Chat**: Communicate in room lobbies
- **📊 Detailed Analytics**: Post-game leaderboards and performance graphs
- **🔒 Secure Authentication**: Firebase Auth with email/password & Google Sign-In
- **🎨 Modern UI**: Responsive design with Tailwind CSS

## 🖼️ Screenshots

<table>
  <tr>
    <td align="center">Multiplayer Lobby</td>
    <td align="center">Live Race</td>
    <td align="center">Results & Analytics</td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Akarsh1412/KeyFury/main/client/public/lobby.png" width="300" alt="Multiplayer Lobby"></td>
    <td><img src="https://raw.githubusercontent.com/Akarsh1412/KeyFury/main/client/public/race.png" width="300" alt="Live Race"></td>
    <td><img src="https://raw.githubusercontent.com/Akarsh1412/KeyFury/main/client/public/results.png" width="300" alt="Results Page"></td>
  </tr>
</table>

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | Core framework |
| Tailwind CSS | Styling |
| React Router DOM | Navigation |
| Context API + Custom Hooks | State management |
| Socket.IO Client | Real-time communication |
| Firebase Authentication | User management |
| Recharts | Data visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18 | Runtime environment |
| Express.js | Server framework |
| Redis | In-memory data store |
| Socket.IO | Real-time communication |
| dotenv | Environment management |

## ⚙️ Architecture Overview

KeyFury uses an event-driven architecture optimized for real-time performance:

### Core Components
1. **Real-time Engine**: Socket.IO for instant communication
2. **State Management**: Redis as single source of truth
3. **Performance Optimization**:
   - Client-side throttling (300ms stats updates)
   - Background cleanup services
4. **Hybrid Data Flow**:
   - WebSockets for live gameplay events
   - REST API for final results retrieval
5. **Game Synchronization**:
   - Server-controlled countdown timers
   - Client-side latency correction

### Redis Data Structure
```javascript
{
  "room:ABC123": {
    players: {
      "player1": { wpm: 72, accuracy: 98%, progress: 87% },
      "player2": { wpm: 68, accuracy: 95%, progress: 92% }
    },
    chat: [
      { user: "player1", text: "Good luck!", timestamp: 1712345678 },
      { user: "player2", text: "You too!", timestamp: 1712345680 }
    ],
    status: "playing",
    timeLimit: 60
  }
}
```
## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed and configured:
- [Node.js](https://nodejs.org/) v18 or higher
- [Redis](https://redis.io/) instance (local or cloud)
- [Firebase](https://firebase.google.com/) project

### Installation
```bash
# Clone repository
git clone https://github.com/Akarsh1412/KeyFury
cd KeyFury

# Backend setup
cd server
npm install

# Create environment file
cat > .env <<EOL
PORT=8080
CLIENT_URL=http://localhost:5173
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
EOL

# Start backend
npm run dev

# Frontend setup
cd ../client
npm install

# Create environment file (replace with your Firebase credentials)
cat > .env.local <<EOL
VITE_API_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
EOL

# Start frontend
npm run dev
