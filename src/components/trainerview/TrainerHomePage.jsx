import { auth } from "../../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../../utils/auth/AuthProvider";

const TrainerHomePage = () => {
  const user = useAuth();

  return (
    <div>
      <p>hi trainer</p>
      <button>add exercise</button>
      <br />
      <br />
      <button>view exercise database</button>
      <br />
      <br />
      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  );
};

export default TrainerHomePage;
