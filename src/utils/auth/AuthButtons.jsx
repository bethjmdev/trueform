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
        <>
          <a href="/trainer-signin">Sign In as Trainer</a>
          <br />
          <br />
          <a href="/client-signin">Sign In as Client</a>
          <p>
            <br />
            <a href="/trainer-reg">Register Trainer</a>
            <br />
            <br />
            <a href="/client-reg">Register Client</a>
          </p>
        </>
      )}
    </div>
  );
};

export default AuthButtons;
