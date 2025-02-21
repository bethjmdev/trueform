import { auth, db } from "../../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../../utils/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import "../clientview/ClientHomePage.css";
import HomePageButton from "../../utils/buttons/HomePageButton";

const TrainerHomePage = () => {
  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.removeItem("authUser"); // ❌ Clear localStorage
    navigate("/"); // Redirect to home
  };

  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.uid) return;

    const fetchClientProfile = async () => {
      try {
        console.log(`📡 Fetching profile for client UID: ${user.uid}`);
        const clientRef = doc(db, "Trainers", user.uid);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          setClientData(clientSnap.data());
        } else {
          console.error("❌ No client profile found.");
        }
      } catch (error) {
        console.error("❌ Error fetching client profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="ClientHomePage">
      <div className="client_homepage_container">
        <p>Hi {clientData?.name || "Trainer"}</p>
        <div className="homepage_buttons">
          <HomePageButton onClick={() => navigate("/all-clients")}>
            View Clients
          </HomePageButton>
          <HomePageButton onClick={() => navigate("/add-exercise")}>
            Add Exercise
          </HomePageButton>
          <HomePageButton onClick={() => navigate("/exercise-database")}>
            View Exercise Database
          </HomePageButton>
          <HomePageButton onClick={() => navigate("/profile")}>
            View Profile
          </HomePageButton>
          <HomePageButton onClick={handleSignOut}>Sign Out</HomePageButton>{" "}
        </div>
      </div>
    </div>
  );
};

export default TrainerHomePage;
