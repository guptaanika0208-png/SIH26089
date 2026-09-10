import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;