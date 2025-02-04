import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignUpFormClient = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trainers, setTrainers] = useState([]); // Store trainers list
  const [selectedTrainer, setSelectedTrainer] = useState(""); // Store selected trainer UID
  const navigate = useNavigate();

  // Fetch trainers from Firestore when component mounts
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const trainersCollection = collection(db, "Trainers");
        const trainersSnapshot = await getDocs(trainersCollection);
        const trainersList = trainersSnapshot.docs.map((doc) => ({
          uid: doc.id,
          name: doc.data().name,
        }));
        setTrainers(trainersList);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      }
    };

    fetchTrainers();
  }, []);

  const handleSignUp = async () => {
    try {
      if (!selectedTrainer) {
        alert("Please select a trainer.");
        return;
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save client details to Firestore (including selected trainer's UID)
      await setDoc(doc(db, "Clients", user.uid), {
        name: name,
        email: email,
        uid: user.uid,
        trainer: selectedTrainer, // Store trainer's UID
      });

      // 🔥 Add this client to the selected trainer's `clients` array
      const trainerRef = doc(db, "Trainers", selectedTrainer);
      await updateDoc(trainerRef, {
        clients: arrayUnion(user.uid), // Adds the client's UID to the trainer's clients array
      });

      navigate("/client-dashboard"); // Redirect to client dashboard after successful sign-up
    } catch (error) {
      console.error("Sign Up Error:", error.message);
    }
  };

  return (
    <div>
      <h2>Register as a Client</h2>
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

      {/* Trainer Dropdown Selection */}
      <select
        value={selectedTrainer}
        onChange={(e) => setSelectedTrainer(e.target.value)}
      >
        <option value="">Select Your Trainer</option>
        {trainers.map((trainer) => (
          <option key={trainer.uid} value={trainer.uid}>
            {trainer.name}
          </option>
        ))}
      </select>

      <button onClick={handleSignUp}>Sign Up</button>
      <p>
        Already have an account? <a href="/client-signin">Sign in</a>
      </p>
    </div>
  );
};

export default SignUpFormClient;
