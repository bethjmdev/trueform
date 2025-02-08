// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { db } from "../../../utils/firebase/firebaseConfig";
// import { doc, getDoc } from "firebase/firestore";

// const ViewIndWorkout = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const exercise_doc_id = location.state?.exercise_doc_id;
//   const [exercises, setExercises] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!exercise_doc_id) {
//       console.error("❌ No exercise_doc_id found. Redirecting...");
//       navigate("/all-clients");
//     }
//   }, [exercise_doc_id, navigate]);

//   useEffect(() => {
//     if (!exercise_doc_id) return;

//     const fetchExerciseDetails = async () => {
//       try {
//         console.log(
//           `📡 Fetching exercise details for doc ID: ${exercise_doc_id}`
//         );

//         const exerciseRef = doc(db, "CurrentWorkoutExercises", exercise_doc_id);
//         const exerciseSnap = await getDoc(exerciseRef);

//         if (exerciseSnap.exists()) {
//           console.log("✅ Exercise details found:", exerciseSnap.data());

//           const exerciseData = exerciseSnap.data();
//           const exerciseArray = Object.entries(exerciseData).map(
//             ([name, details]) => ({
//               name,
//               ...details,
//             })
//           );

//           setExercises(exerciseArray);
//         } else {
//           console.error("❌ No exercise found for this ID.");
//         }
//       } catch (error) {
//         console.error("❌ Error fetching exercise details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExerciseDetails();
//   }, [exercise_doc_id]);

//   if (!exercise_doc_id) return null;

//   return (
//     <div>
//       <h2>Workout Exercise Details</h2>

//       {loading && <p>Loading exercise details...</p>}

//       {!loading && exercises.length === 0 && <p>No exercise details found.</p>}

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

//               {exercise.cues && (
//                 <p>
//                   <strong>Cues:</strong> {exercise.cues}
//                 </p>
//               )}

//               <hr />
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* 🔥 Edit Button to navigate to EditWorkout */}
//       <button
//         onClick={() =>
//           navigate("/edit-workout", { state: { exercise_doc_id } })
//         }
//       >
//         Edit Workout
//       </button>
//     </div>
//   );
// };

// export default ViewIndWorkout;
//
//
//
//
//
//
//
//
//
//
//
//
//



import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ViewIndWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exercise_doc_id = location.state?.exercise_doc_id; // Get exercise_doc_id from navigation state
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if accessed without exercise_doc_id
  useEffect(() => {
    if (!exercise_doc_id) {
      console.error("❌ No exercise_doc_id found. Redirecting...");
      navigate("/all-clients");
    }
  }, [exercise_doc_id, navigate]);

  useEffect(() => {
    if (!exercise_doc_id) return;

    const fetchExerciseDetails = async () => {
      try {
        console.log(
          `📡 Fetching exercise details for doc ID: ${exercise_doc_id}`
        );

        // Get the document from CurrentWorkoutExercises where ID matches exercise_doc_id
        const exerciseRef = doc(db, "CurrentWorkoutExercises", exercise_doc_id);
        const exerciseSnap = await getDoc(exerciseRef);

        if (exerciseSnap.exists()) {
          console.log("✅ Exercise details found:", exerciseSnap.data());

          // Convert object to array
          const exerciseData = exerciseSnap.data();
          const exerciseArray = Object.entries(exerciseData).map(
            ([name, details]) => ({
              name,
              ...details,
            })
          );

          setExercises(exerciseArray);
        } else {
          console.error("❌ No exercise found for this ID.");
        }
      } catch (error) {
        console.error("❌ Error fetching exercise details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [exercise_doc_id]);

  if (!exercise_doc_id) return null; // Prevents rendering if no ID is found

  // 🔥 Group exercises by circuit_id
  const groupedExercises = exercises.reduce((groups, exercise) => {
    const circuitId = exercise.circuit_id || "standalone";
    if (!groups[circuitId]) {
      groups[circuitId] = [];
    }
    groups[circuitId].push(exercise);
    return groups;
  }, {});

  return (
    <div>
      <h2>Workout Exercise Details</h2>

      {loading && <p>Loading exercise details...</p>}

      {!loading && exercises.length === 0 && <p>No exercise details found.</p>}

      {/* 🔥 Render exercises grouped by circuits */}
      {Object.entries(groupedExercises).map(([circuitId, exercises]) => (
        <div
          key={circuitId}
          style={{
            border: circuitId !== "standalone" ? "2px solid blue" : "none",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          {circuitId !== "standalone" && <h3>🔥 Circuit</h3>}
          {exercises.map((exercise, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <h3>{exercise.name}</h3>
              <p>
                <strong>Reps:</strong> {exercise.reps}
              </p>
              <p>
                <strong>Sets:</strong> {exercise.sets}
              </p>
              <p>
                <strong>Weight:</strong> {exercise.weight} lbs
              </p>
              <p>
                <strong>Cues:</strong> {exercise.cues}
              </p>
              <hr />
            </div>
          ))}
        </div>
      ))}

      {/* Edit Workout Button */}
      <button
        onClick={() =>
          navigate("/edit-workout", { state: { exercise_doc_id } })
        }
      >
        Edit Workout
      </button>
    </div>
  );
};

export default ViewIndWorkout;
