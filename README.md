# KeyFury

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFA611?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.2-010101?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Upstash_Redis-Serverless-DC382D?style=for-the-badge&logo=redis)](https://upstash.com/redis)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

KeyFury is a real-time multiplayer typing game where players compete in typing challenges. Join rooms, chat with competitors, and test your typing speed against others with live statistics and post-game analytics. Also features a clean, distraction-free single-player mode.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Here-brightgreen?style=for-the-badge)](https://key-fury.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-View_Source-blue?style=for-the-badge&logo=github)](https://github.com/Akarsh1412/KeyFury)

![KeyFury Logo](https://raw.githubusercontent.com/Akarsh1412/KeyFury/main/client/public/favicon.png)

## ✨ Features

- **Multiplayer Mode**: Create private rooms or join existing ones using a unique Room ID.
- **Single Player Mode**: Practice and improve your typing speed with configurable time limits (15, 30, 45, 60 seconds).
- **Real-time Competition**: See every player's WPM, accuracy, and progress bar update live during a match.
- **Synchronized Gameplay**: A server-managed countdown ensures all players in a room start the test simultaneously for a fair race.
- **Live In-Game Chat**: Communicate with other players in the room lobby before the game starts.
- **Detailed Post-Game Analytics**: After each match, view a detailed leaderboard and personal performance stats. Compare your WPM, accuracy, and progress over time against other players with interactive graphs powered by **Recharts**.
- **Secure Authentication**: User accounts are managed with **Firebase Authentication**, supporting both email/password and Google Sign-In.
- **Modern & Responsive UI**: A sleek, distraction-free interface built with **React** and **Tailwind CSS**.

## 📸 Screenshots

### Home Page
<img width="1903" height="985" alt="image" src="https://github.com/user-attachments/assets/fcf64b92-fa05-4e36-b231-6f875de07b57" />

### Multiplayer Lobby
<img width="1903" height="989" alt="image" src="https://github.com/user-attachments/assets/ee576ec5-56e8-4f3b-a2c2-3e495dd745af" />

### Live Race
<img width="1899" height="983" alt="image" src="https://github.com/user-attachments/assets/9579bb0f-1be0-4bb4-9255-4830115480d2" />

### Results
<img width="1900" height="990" alt="image" src="https://github.com/user-attachments/assets/8d8ef2e8-cb5d-4cb3-8b40-52eb0f9d95ec" />
<img width="1901" height="983" alt="image" src="https://github.com/user-attachments/assets/1790acce-f6b4-44e8-b18b-6d29c657b3ce" />

## 🛠️ Tech Stack

The project is a monorepo with a separate `client` and `server` directory.

### Frontend
- **Framework**: React 18 (with Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Real-time Communication**: Socket.IO Client
- **Authentication**: Firebase Authentication
- **Data Fetching**: Axios
- **Data Visualization**: Recharts
- **State Management**: React Context API, Custom Hooks (`useEngine`, `useSyncedTimer`)
- **UI/UX**: Lucide React (icons), React Toastify (notifications)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database / In-Memory Store**: [Upstash Redis](https://upstash.com/redis)
- **Real-time Communication**: Socket.IO
- **Environment Management**: `dotenv`

## 🏗️ Architecture Overview

KeyFury is built on a robust, event-driven architecture designed for low-latency, real-time interactions.

- **Real-time Engine with Socket.IO**: The core of the multiplayer experience is powered by Socket.IO. The server listens for events like `createRoom`, `joinRoom`, `startTest`, and `chatMessage`, and efficiently broadcasts state updates to the relevant clients.

- **State Management with Upstash Redis**: The project leverages **Upstash** for a serverless Redis database, ensuring low-latency data access and simplifying management. It serves as the single source of truth for all ephemeral game data:
  - **Room & Player Data**: Stored in Redis Hashes for quick read/write access. This includes live stats and the final `performanceHistory` for each player.
  - **Chat History**: Stored in Redis Lists, capped to the last 50 messages to save memory.
  - **Session Management**: Each socket connection is mapped to a user and room, with a TTL for automatic cleanup.
  - **Efficiency**: **Redis Pipelining** is used to batch multiple commands into a single request, reducing network round-trip time and ensuring atomicity for complex operations.

- **Performance Optimization**:
  - **Throttling**: To prevent overwhelming the server with frequent updates, player stats (`WPM`, `progress`) are sent from the client using a custom `useThrottle` hook. This limits the rate of `updateStats` emits to one every 300ms.
  - **Background Services**: The server runs periodic cleanup tasks to validate active rooms and remove stale data, ensuring the application remains stable and performant over time.

- **Hybrid Data Flow**: The application uses a hybrid data flow model. Real-time game events and live stats are handled via WebSockets. After the test, the comprehensive results, including `performanceHistory`, are fetched via a standard RESTful API endpoint (`/api/results/:roomId`). This approach leverages the strengths of both protocols: WebSockets for low-latency live updates and REST for retrieving a final, complete dataset.

- **Game Synchronization**: The `useSyncedTimer` custom hook on the frontend works in tandem with the server to keep all players' timers perfectly aligned. The server broadcasts sync events every 2 seconds, and the client-side hook intelligently corrects for network latency, providing a smooth and fair countdown experience.

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn
- A Redis instance. The project is configured for **[Upstash Redis](https://upstash.com/)**, but a local instance or another cloud provider will also work.

### 1. Clone the Repository
  ```
  git clone https://github.com/Akarsh1412/KeyFury
  cd KeyFury
  ```

### 2. Backend Setup
- Navigate to the server directory
  ```
  cd server
  ```
- Install dependencies
  ```
  npm install
  ```
- Create a `.env` file. You can get your `REDIS_URL` and `REDIS_TOKEN` from your Upstash database console.

  **`server/.env`**
  ```
  PORT=5000
  CLIENT_URL=http://localhost:5173

  REDIS_URL=YOUR_UPSTASH_REDIS_URL
  REDIS_TOKEN=YOUR_UPSTASH_REDIS_TOKEN
  ```

- Finally, start the backend server:
  ```
  npm run dev
  ```
### 3. Frontend Setup
- Navigate to the client directory from the root
  ```
  cd client
  ```
- Install dependencies
  ```
  npm install
  ```
- Set up a new project on the [Firebase Console](https://console.firebase.google.com/). Enable Email/Password and Google authentication methods. Then, get your project's configuration keys and add them to a new `.env` file.

    **`client/.env`**
  ```
  VITE_BACKEND_URL="http://localhost:5000"

  VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
  VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
  VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
  VITE_FIREBASE_STORGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
  VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
  VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
  VITE_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
  ```
- Finally, start the frontend development server:
  ```
  npm run dev
  ```


You can now access the application at `http://localhost:5173`.

## 📡 API and Key Events

### Socket.IO Events

- `createRoom`: Initializes a new room with the creator as the leader.
- `joinRoom`: Allows a user to join an existing room.
- `leaveRoom`: Removes a player from a room and handles leader reassignment if necessary.
- `chatMessage`: Broadcasts a message to all players in a room.
- `startTest`: Initiated by the room leader; starts the countdown for all players.
- `updateStats`: Sent from a client to the server to update their live game statistics.
- `liveStats`: Broadcast from the server to all clients with updated stats for all players.
- `testEnded`: Sent when the game is over (time up or all players finished).

### REST API Endpoints

- `GET /api/results/:roomId`: Fetches the final results and performance history for all players in a completed game.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or want to report a bug, please feel free to open an issue on the [GitHub repository](https://github.com/Akarsh1412/KeyFury/issues).

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
