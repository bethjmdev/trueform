// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthProvider"; // Import authentication context

// const ProtectedRoute = ({ element }) => {
//   const user = useAuth(); // Get the authenticated user

//   return user ? element : <Navigate to="/" />; // Redirect if not authenticated
// };

// export default ProtectedRoute; // Ensure default export

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // Prevents redirecting before Firebase finishes checking

  return user ? element : <Navigate to="/" />;
};

export default ProtectedRoute;
