import { auth } from "../../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../../utils/auth/AuthProvider";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import "./ClientHomePage.css";

const ClientHomePage = () => {
  const user = useAuth();
  const navigate = useNavigate();

  return (
    <div className="ClientHomePage">
      <div className="client_homepage_container">
        <p>hi Client</p>
        <div className="homepage_buttons">
          <button onClick={() => signOut(auth)}>Sign Out</button>
          <br />
          <br />
          <button onClick={() => navigate("/view-workout")}>
            View Workouts
          </button>
          <br />
          <br />
          <button onClick={() => navigate("/client-view-profile")}>
            View Profile
          </button>
          <br />
          <br />
          <button onClick={() => navigate("/client-past-workouts")}>
            View Past Workouts
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientHomePage;
