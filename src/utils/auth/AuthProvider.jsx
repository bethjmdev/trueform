// import { createContext, useEffect, useState, useContext } from "react";
// import { auth } from "../firebase/firebaseConfig";
// import { onAuthStateChanged } from "firebase/auth";

// // Create the authentication context
// const AuthContext = createContext(null);

// // AuthProvider component manages the user state
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Listen for authentication state changes
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });

//     return () => unsubscribe(); // Cleanup the listener when component unmounts
//   }, []);

//   return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
// };

// // Custom hook to use authentication state in other components
// export const useAuth = () => useContext(AuthContext);

import { createContext, useEffect, useState, useContext } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if user is a Trainer or Client
        const trainerRef = doc(db, "Trainers", currentUser.uid);
        const trainerDoc = await getDoc(trainerRef);

        if (trainerDoc.exists()) {
          setUser({ ...currentUser, role: "Trainer" });
        } else {
          const clientRef = doc(db, "Clients", currentUser.uid);
          const clientDoc = await getDoc(clientRef);

          if (clientDoc.exists()) {
            setUser({ ...currentUser, role: "Client" });
          } else {
            // If user is not in either collection, sign them out
            await signOut(auth);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
