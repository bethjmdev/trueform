import { useEffect, useState } from "react";
import { useAuth } from "../utils/auth/AuthProvider";
import { db } from "../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";

import "./NavBar.css";

const NavBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setRoleChecked(true);
        return;
      }

      // Check localStorage for role
      const storedUser = JSON.parse(localStorage.getItem("authUser"));
      if (storedUser?.role) {
        setRole(storedUser.role);
        setRoleChecked(true);
        return;
      }

      try {
        let userRole = null;

        // Check Firestore for role
        const trainerRef = doc(db, "Trainers", user.uid);
        const trainerDoc = await getDoc(trainerRef);
        if (trainerDoc.exists()) {
          userRole = "Trainer";
        }

        const clientRef = doc(db, "Clients", user.uid);
        const clientDoc = await getDoc(clientRef);
        if (clientDoc.exists()) {
          userRole = "Client";
        }

        if (userRole) {
          localStorage.setItem(
            "authUser",
            JSON.stringify({ ...user, role: userRole })
          );
          setRole(userRole);
        }

        setRoleChecked(true);
      } catch (error) {
        console.error("Error checking user role:", error);
        setRoleChecked(true);
      }
    };

    checkUserRole();
  }, [user]);

  // Redirect to the correct homepage
  const handleHomeClick = () => {
    if (role === "Trainer") {
      navigate("/trainer-homepage");
    } else if (role === "Client") {
      navigate("/client-homepage");
    } else {
      navigate("/");
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.removeItem("authUser"); // Clear localStorage
    navigate("/"); // Redirect to home
  };

  return (
    <div className="NavBar">
      {!roleChecked ? (
        <p>Loading...</p>
      ) : (
        <div className="nav_bar_container">
          <p onClick={handleHomeClick} style={{ cursor: "pointer" }}>
            Home
          </p>
          <p id="logo">Vital Form</p>
          <p onClick={handleSignOut} style={{ cursor: "pointer" }}>
            Sign out
          </p>
        </div>
      )}
    </div>
  );
};

export default NavBar;
