import { auth } from "../../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../../utils/auth/AuthProvider";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ClientHomePage = () => {
  const user = useAuth();

  return (
    <div>
      <p>hi Client</p>
      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  );
};

export default ClientHomePage;
