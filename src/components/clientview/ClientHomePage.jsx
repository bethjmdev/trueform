import { auth } from "../../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../../utils/auth/AuthProvider";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ClientHomePage = () => {
  const user = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <p>hi Client</p>
      <button onClick={() => signOut(auth)}>Sign Out</button>
      <br />
      <br />
      <button onClick={() => navigate("/view-workout")}>View Workouts</button>
      <br />
      <br />
      <button onClick={() => navigate("/client-view-profile")}>
        View Profile
      </button>
    </div>
  );
};

export default ClientHomePage;
