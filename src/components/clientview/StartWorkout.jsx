import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase/firebaseConfig"; // Ensure Firebase is imported
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth"; // Import Firebase auth

const StartWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for redirecting
  const workoutDetails = location.state?.workoutDetails;
  const [time, setTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState({});
  const [notes, setNotes] = useState(""); // Notes state
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // New state for questions
  const [questions, setQuestions] = useState({
    slept_6_hours: "",
    motivated: "",
    ate_enough: "",
    hydrated: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (workoutDetails) {
      const initialWeights = {};
      Object.entries(workoutDetails).forEach(([exercise, details]) => {
        initialWeights[exercise] = details.weight ? String(details.weight) : "";
      });
      setWeights(initialWeights);
    }
  }, [workoutDetails]);

  const handleWeightChange = (exercise, value) => {
    setWeights((prevWeights) => ({
      ...prevWeights,
      [exercise]: value,
    }));
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleQuestionChange = (question, value) => {
    setQuestions((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const saveWorkout = async () => {
    if (!workoutDetails || !currentUser) return;

    setSaving(true);
    const exerciseDocId = uuidv4(); // Generate unique ID

    try {
      // Stop the timer
      clearInterval(time);

      // Save workout details
      await setDoc(doc(collection(db, "PastWorkoutDetails"), exerciseDocId), {
        uid: currentUser.uid, // Save the current user's UID
        timestamp: serverTimestamp(), // Save timestamp
        duration_seconds: time, // Save workout duration
        notes: notes.trim(), // Save user-entered notes
        ...questions, // Save responses to questions
      });

      // Save workout exercises
      const workoutExercises = {};
      Object.entries(workoutDetails).forEach(([exercise, details]) => {
        workoutExercises[exercise] = {
          ...details,
          weight: weights[exercise] || "0", // Save entered weight
        };
      });

      await setDoc(
        doc(collection(db, "PastWorkoutExercises"), exerciseDocId),
        workoutExercises
      );

      alert("Workout saved successfully!");

      // Redirect user to Client Homepage
      navigate("/client-homepage");
    } catch (error) {
      console.error("Error saving workout:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!workoutDetails) return <p>Workout data not found.</p>;

  return (
    <div>
      <h2>Workout in Progress</h2>

      {/* Pre-Workout Questions */}
      <div>
        {[
          {
            key: "slept_6_hours",
            question: "Did you sleep more than 6 hours last night?",
          },
          {
            key: "motivated",
            question: "Do you feel motivated to workout right now?",
          },
          {
            key: "ate_enough",
            question: "Have you had enough to eat/drink today?",
          },
          { key: "hydrated", question: "Have you had enough water today?" },
        ].map(({ key, question }) => (
          <div key={key}>
            <p>
              <strong>{question}</strong>
            </p>
            <button
              onClick={() => handleQuestionChange(key, "Yes")}
              style={{
                backgroundColor: questions[key] === "Yes" ? "#4CAF50" : "#ddd",
                color: questions[key] === "Yes" ? "white" : "black",
                marginRight: "10px",
                padding: "8px 16px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Yes
            </button>
            <button
              onClick={() => handleQuestionChange(key, "No")}
              style={{
                backgroundColor: questions[key] === "No" ? "#FF5252" : "#ddd",
                color: questions[key] === "No" ? "white" : "black",
                padding: "8px 16px",
                border: "none",
                cursor: "pointer",
              }}
            >
              No
            </button>
          </div>
        ))}
      </div>

      {/* Notes Input */}
      <div style={{ marginTop: "20px" }}>
        <label>
          <strong>Notes:</strong>
        </label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add workout notes..."
          rows="3"
          style={{ width: "100%", marginTop: "5px" }}
        />
      </div>

      {/* Save Workout Button */}
      <button
        onClick={saveWorkout}
        disabled={saving}
        style={{ marginTop: "10px" }}
      >
        {saving ? "Saving..." : "Save Workout"}
      </button>

      {/* Display Workout Details */}
      {Object.entries(workoutDetails).map(([exercise, details], index) => (
        <div key={index}>
          <h3>{exercise}</h3>
          <p>
            <strong>Reps:</strong> {details.reps}
          </p>
          <p>
            <strong>Sets:</strong> {details.sets}
          </p>
          <p>
            <strong>Weight:</strong>
            <input
              type="number"
              value={weights[exercise] ?? ""}
              onChange={(e) => handleWeightChange(exercise, e.target.value)}
              style={{ marginLeft: "10px", width: "60px" }}
            />{" "}
            lbs
          </p>
          <p>
            <strong>Cues:</strong> {details.cues}
          </p>
          {details.circuit_id && <p>🔥 Circuit</p>}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default StartWorkout;
