import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white text-center py-20">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
