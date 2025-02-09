// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { db } from "../../utils/firebase/firebaseConfig"; // Ensure Firebase is imported
// import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
// import { v4 as uuidv4 } from "uuid";
// import { getAuth } from "firebase/auth"; // Import Firebase auth

// const StartWorkout = () => {
//   const location = useLocation();
//   const workoutDetails = location.state?.workoutDetails;
//   const [time, setTime] = useState(0);
//   const [saving, setSaving] = useState(false);
//   const [weights, setWeights] = useState({});
//   const [notes, setNotes] = useState(""); // New notes state
//   const auth = getAuth();
//   const currentUser = auth.currentUser;

//   console.log(workoutDetails);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTime((prevTime) => prevTime + 1);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     if (workoutDetails) {
//       const initialWeights = {};
//       Object.entries(workoutDetails).forEach(([exercise, details]) => {
//         initialWeights[exercise] = details.weight ? String(details.weight) : "";
//       });
//       setWeights(initialWeights);
//     }
//   }, [workoutDetails]);

//   const handleWeightChange = (exercise, value) => {
//     setWeights((prevWeights) => ({
//       ...prevWeights,
//       [exercise]: value,
//     }));
//   };

//   const handleNotesChange = (e) => {
//     setNotes(e.target.value); // Update notes state
//   };

//   const saveWorkout = async () => {
//     if (!workoutDetails || !currentUser) return;

//     setSaving(true);
//     const exerciseDocId = uuidv4(); // Generate unique ID

//     try {
//       // Save workout details
//       await setDoc(doc(collection(db, "PastWorkoutDetails"), exerciseDocId), {
//         uid: currentUser.uid, // Save the current user's UID
//         timestamp: serverTimestamp(), // Save timestamp
//         duration_seconds: time, // Save workout duration
//         notes: notes.trim(), // Save user-entered notes
//       });

//       // Save workout exercises
//       const workoutExercises = {};
//       Object.entries(workoutDetails).forEach(([exercise, details]) => {
//         workoutExercises[exercise] = {
//           ...details,
//           weight: weights[exercise] || "0", // Save entered weight
//         };
//       });

//       await setDoc(
//         doc(collection(db, "PastWorkoutExercises"), exerciseDocId),
//         workoutExercises
//       );

//       alert("Workout saved successfully!");
//     } catch (error) {
//       console.error("Error saving workout:", error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!workoutDetails) return <p>Workout data not found.</p>;

//   return (
//     <div>
//       <h2>Workout in Progress</h2>

//       {/* Notes Input */}
//       <div>
//         <label>
//           <strong>Notes:</strong>
//         </label>
//         <textarea
//           value={notes}
//           onChange={handleNotesChange}
//           placeholder="Add workout notes..."
//           rows="3"
//           style={{ width: "100%", marginTop: "5px" }}
//         />
//       </div>

//       {/* Save Workout Button */}
//       <button
//         onClick={saveWorkout}
//         disabled={saving}
//         style={{ marginTop: "10px" }}
//       >
//         {saving ? "Saving..." : "Save Workout"}
//       </button>

//       {/* Display Workout Details */}
//       {Object.entries(workoutDetails).map(([exercise, details], index) => (
//         <div key={index}>
//           <h3>{exercise}</h3>
//           <p>
//             <strong>Reps:</strong> {details.reps}
//           </p>
//           <p>
//             <strong>Sets:</strong> {details.sets}
//           </p>
//           <p>
//             <strong>Weight:</strong>
//             <input
//               type="number"
//               value={weights[exercise] ?? ""}
//               onChange={(e) => handleWeightChange(exercise, e.target.value)}
//               style={{ marginLeft: "10px", width: "60px" }}
//             />{" "}
//             lbs
//           </p>
//           <p>
//             <strong>Cues:</strong> {details.cues}
//           </p>
//           {details.circuit_id && <p>🔥 Circuit</p>}
//           <hr />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default StartWorkout;

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

  console.log(workoutDetails);

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

      {/* Notes Input */}
      <div>
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
