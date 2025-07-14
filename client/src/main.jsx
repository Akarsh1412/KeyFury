import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/socketContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Type from './components/Type.jsx';
import Multiplayer from './components/Multiplayer.jsx';
import Room from './pages/Room.jsx';
import MultiplayerTest from './pages/MultiplayerTest.jsx';
import MultiplayerResults from './pages/MultiplayerResults.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="type" element={<Type />} />
      
      {/* Protected Multiplayer Routes */}
      <Route
        path="multiplayer"
        element={
          <ProtectedRoute>
            <Multiplayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="multiplayer/join/:roomId"
        element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        }
      />
      <Route
        path="multiplayer/test/:roomId"
        element={
          <ProtectedRoute>
            <MultiplayerTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="multiplayer/results/:roomId"
        element={
        <ProtectedRoute>
          <MultiplayerResults />
        </ProtectedRoute>
        }
      />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </AuthProvider>
  // </StrictMode>
);
