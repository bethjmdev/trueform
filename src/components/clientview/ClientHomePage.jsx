import { useEffect, useState } from "react";
import { auth, db } from "../../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../../utils/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import "./ClientHomePage.css";
import HomePageButton from "../../utils/buttons/HomePageButton";

const ClientHomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.uid) return;

    const fetchClientProfile = async () => {
      try {
        console.log(`📡 Fetching profile for client UID: ${user.uid}`);
        const clientRef = doc(db, "Clients", user.uid);
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
        <p>Hi {clientData?.name || "Client"}</p>
        <div className="homepage_buttons">
          <HomePageButton onClick={() => signOut(auth)}>
            Sign Out
          </HomePageButton>

          <HomePageButton onClick={() => navigate("/view-workout")}>
            View Workouts
          </HomePageButton>

          <HomePageButton onClick={() => navigate("/client-view-profile")}>
            View Profile
          </HomePageButton>

          <HomePageButton onClick={() => navigate("/client-past-workouts")}>
            View Past Workouts
          </HomePageButton>
        </div>
      </div>
    </div>
  );
};

export default ClientHomePage;
