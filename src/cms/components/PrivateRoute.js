import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="cms-loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/cms/login" replace />;
  }

  return children;
}

export default PrivateRoute;
