import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <LoadingScreen subtitle="Setting things up..."/>
    );

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;