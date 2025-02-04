import { createContext, useEffect, useState, useContext } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Create the authentication context
const AuthContext = createContext(null);

// AuthProvider component manages the user state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup the listener when component unmounts
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

// Custom hook to use authentication state in other components
export const useAuth = () => useContext(AuthContext);
