// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthProvider";
// import { db } from "../firebase/firebaseConfig";
// import { doc, getDoc } from "firebase/firestore";
// import { useEffect, useState } from "react";

// const ProtectedRoute = ({ element, trainerOnly = false }) => {
//   const { user, loading } = useAuth();
//   const [isTrainer, setIsTrainer] = useState(null); // `null` means still checking

//   useEffect(() => {
//     const checkTrainerStatus = async () => {
//       if (!user) {
//         setIsTrainer(false);
//         return;
//       }

//       try {
//         const trainerRef = doc(db, "Trainers", user.uid);
//         const trainerDoc = await getDoc(trainerRef);

//         if (trainerDoc.exists()) {
//           setIsTrainer(true);
//         } else {
//           setIsTrainer(false);
//         }
//       } catch (error) {
//         console.error("Error checking trainer status:", error);
//         setIsTrainer(false);
//       }
//     };

//     if (trainerOnly) {
//       checkTrainerStatus();
//     }
//   }, [user, trainerOnly]);

//   if (loading || (trainerOnly && isTrainer === null)) return <p>Loading...</p>;

//   if (!user) return <Navigate to="/" />;

//   if (trainerOnly && !isTrainer) return <Navigate to="/trainer-signin" />;

//   return element;
// };

// export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ element, trainerOnly = false }) => {
  const { user, loading } = useAuth();
  const [isTrainer, setIsTrainer] = useState(null); // `null` means still checking

  useEffect(() => {
    const checkTrainerStatus = async () => {
      if (!user) {
        setIsTrainer(false);
        return;
      }

      // ✅ Check if user role is already stored in localStorage
      const storedUser = JSON.parse(localStorage.getItem("authUser"));
      if (storedUser?.role === "Trainer") {
        setIsTrainer(true);
        return;
      }

      try {
        const trainerRef = doc(db, "Trainers", user.uid);
        const trainerDoc = await getDoc(trainerRef);

        if (trainerDoc.exists()) {
          setIsTrainer(true);
          localStorage.setItem(
            "authUser",
            JSON.stringify({ ...user, role: "Trainer" })
          ); // ✅ Store trainer role in localStorage
        } else {
          setIsTrainer(false);
        }
      } catch (error) {
        console.error("Error checking trainer status:", error);
        setIsTrainer(false);
      }
    };

    if (trainerOnly) {
      checkTrainerStatus();
    }
  }, [user, trainerOnly]);

  if (loading || (trainerOnly && isTrainer === null)) return <p>Loading...</p>;

  if (!user) return <Navigate to="/" />;

  if (trainerOnly && !isTrainer) return <Navigate to="/trainer-signin" />;

  return element;
};

export default ProtectedRoute;
