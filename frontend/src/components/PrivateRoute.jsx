import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { session, profile, loading } = useAuth();

  if (loading) return <p className="page-status">Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (role && profile?.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default PrivateRoute;
