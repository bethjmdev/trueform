import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../utils/firebase/firebaseConfig"; // Ensure Firebase is imported
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const StartWorkout = () => {
  const location = useLocation();
  const workoutDetails = location.state?.workoutDetails;
  const [time, setTime] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const saveWorkout = async () => {
    if (!workoutDetails) return;

    setSaving(true);
    const exerciseDocId = uuidv4(); // Generate unique ID

    // Workout details
    const workoutData = {
      client_uid: "BYi7ngW4Qcdd80OuH37Zig0G2I62", // Replace with actual user UID
      trainer_uid: "mMvzoIRDMsgNDYooKgQU49LvBb32", // Replace with actual trainer UID
      workout_name: "Workout Name", // Replace with actual workout name
      exercise_doc_id: exerciseDocId,
      notes: "Workout Notes", // Replace with actual notes
      timestamp: serverTimestamp(), // Save timestamp
      duration_seconds: time, // Save workout duration
    };

    // Workout exercises
    const workoutExercises = {};
    Object.entries(workoutDetails).forEach(([exercise, details]) => {
      workoutExercises[exercise] = {
        circuit_id: details.circuit_id || null,
        cues: details.cues,
        reps: details.reps,
        sets: details.sets,
        weight: details.weight,
      };
    });

    try {
      // Save to Firestore
      await setDoc(
        doc(collection(db, "PastWorkoutDetails"), exerciseDocId),
        workoutData
      );
      await setDoc(
        doc(collection(db, "PastWorkoutExercises"), exerciseDocId),
        workoutExercises
      );

      alert("Workout saved successfully!");
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

      {/* Save Workout Button */}
      <button onClick={saveWorkout} disabled={saving}>
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
            <strong>Weight:</strong> {details.weight} lbs
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
