import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "./AuthProvider";

const AuthButtons = () => {
  const user = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={() => signOut(auth)}>Sign Out</button>
        </div>
      ) : (
        <p>
          <a href="/signin">Sign In</a> or
          <p>
            Don't have an account? Register...
            <br />
            <a href="/trainer-reg">Trainer</a>
            <br />
            <br />
            <br />
            <br />
            <br />
            <a href="/client-reg">Client</a>
          </p>
        </p>
      )}
    </div>
  );
};

export default AuthButtons;
