import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider"; // Import authentication context

const ProtectedRoute = ({ element }) => {
  const user = useAuth(); // Get the authenticated user

  return user ? element : <Navigate to="/" />; // Redirect if not authenticated
};

export default ProtectedRoute; // Ensure default export
