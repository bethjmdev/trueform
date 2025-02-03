import { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignUpFormTrainer = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save trainer details to Firestore (excluding password)
      await setDoc(doc(db, "Trainers", user.uid), {
        name: name,
        email: email,
        uid: user.uid, // Saving UID as well for reference
        clients: [],
      });

      navigate("/"); // Redirect after successful sign-up
    } catch (error) {
      console.error("Sign Up Error:", error.message);
    }
  };

  return (
    <div className="Trainer_SignUp">
      <h2>Register as a Trainer</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <button onClick={handleSignUp}>Sign Up</button>
      <p>
        Already have an account? <a href="/trainer-signin">Sign in</a>
      </p>
    </div>
  );
};

export default SignUpFormTrainer;
