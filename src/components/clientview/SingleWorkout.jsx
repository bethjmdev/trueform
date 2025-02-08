// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { db } from "../../utils/firebase/firebaseConfig";
// import { doc, getDoc } from "firebase/firestore";

// const SingleWorkout = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const exercise_doc_id = location.state?.exercise_doc_id; // Get exercise_doc_id from navigation state
//   const [exercises, setExercises] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Redirect if accessed without exercise_doc_id
//   useEffect(() => {
//     if (!exercise_doc_id) {
//       console.error("❌ No exercise_doc_id found. Redirecting...");
//       navigate("/view-workouts");
//     }
//   }, [exercise_doc_id, navigate]);

//   useEffect(() => {
//     if (!exercise_doc_id) return;

//     const fetchWorkoutExercises = async () => {
//       try {
//         console.log(`📡 Fetching workout exercises for: ${exercise_doc_id}`);

//         const exerciseRef = doc(db, "CurrentWorkoutExercises", exercise_doc_id);
//         const exerciseSnap = await getDoc(exerciseRef);

//         if (exerciseSnap.exists()) {
//           console.log("✅ Exercises loaded:", exerciseSnap.data());

//           const exerciseData = exerciseSnap.data();
//           const exerciseArray = Object.entries(exerciseData).map(
//             ([name, details]) => ({
//               name,
//               ...details,
//             })
//           );

//           setExercises(exerciseArray);
//         } else {
//           console.error("❌ No exercises found.");
//         }
//       } catch (error) {
//         console.error("❌ Error fetching workout exercises:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWorkoutExercises();
//   }, [exercise_doc_id]);

//   if (!exercise_doc_id) return null; // Prevents rendering if no ID is found

//   return (
//     <div>
//       <h2>Workout Details</h2>

//       {loading && <p>Loading workout details...</p>}

//       {!loading && exercises.length === 0 && <p>No exercises found.</p>}

//       {exercises.length > 0 && (
//         <ul>
//           {exercises.map((exercise, index) => (
//             <li key={index}>
//               <h3>{exercise.name}</h3>
//               <p>
//                 <strong>Reps:</strong> {exercise.reps}
//               </p>
//               <p>
//                 <strong>Sets:</strong> {exercise.sets}
//               </p>
//               <p>
//                 <strong>Weight:</strong> {exercise.weight} lbs
//               </p>
//               <p>
//                 <strong>Cues:</strong> {exercise.cues || "No cues available"}
//               </p>
//               {exercise.circuit_id && <p>🔥 Part of Circuit</p>}
//               <hr />
//             </li>
//           ))}
//         </ul>
//       )}

//       <button onClick={() => navigate("/view-workouts")}>
//         Back to Workouts
//       </button>
//     </div>
//   );
// };

// export default SingleWorkout;

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const SingleWorkout = () => {
  const location = useLocation();
  const exercise_doc_id = location.state?.exercise_doc_id;
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exercise_doc_id) return;

    const fetchWorkoutDetails = async () => {
      try {
        console.log(`📡 Fetching workout details for ID: ${exercise_doc_id}`);
        const docRef = doc(db, "CurrentWorkoutExercises", exercise_doc_id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("✅ Workout details loaded:", docSnap.data());
          setWorkoutDetails(docSnap.data());
        } else {
          console.error("❌ No workout found.");
        }
      } catch (error) {
        console.error("❌ Error fetching workout details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [exercise_doc_id]);

  if (loading) return <p>Loading workout details...</p>;
  if (!workoutDetails) return <p>Workout not found.</p>;

  return (
    <div>
      <h2>Workout Details</h2>
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

export default SingleWorkout;
