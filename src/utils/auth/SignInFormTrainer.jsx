import { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import MainButton from "../buttons/MainButton";
import "./Signin.css";

const SignInFormTrainer = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      // Authenticate user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Cross-check UID with Trainers collection
      const trainerRef = doc(db, "Trainers", user.uid);
      const trainerDoc = await getDoc(trainerRef);

      if (trainerDoc.exists()) {
        // Trainer exists, proceed
        navigate("/trainer-homepage"); // Redirect to trainer's UI
      } else {
        // Not a trainer, sign out user and show error
        setError("Access Denied: This account is not registered as a Trainer.");
        await auth.signOut();
      }
    } catch (error) {
      console.error("Sign In Error:", error.message);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="SignIn">
      <div className="sign_in_container">
        <h2>Sign In as a Trainer</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <MainButton
          onClick={handleSignIn}
          bgColor="#FF6B8B"
          textColor="white"
          hoverColor="#8f9fc7"
        >
          Sign In
        </MainButton>
        <p>
          Don't have an account?{" "}
          <a href="/trainer-reg" style={{ color: "black" }}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignInFormTrainer;
