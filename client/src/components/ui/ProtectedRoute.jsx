import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const userId = useSelector(s => s.storage.userId);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!userId) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
