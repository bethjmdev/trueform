// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { db } from "../../../utils/firebase/firebaseConfig";
// import { doc, getDoc } from "firebase/firestore";

// const IndPastWorkout = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const workoutId = location.state?.workoutId;
//   const [groupedExercises, setGroupedExercises] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!workoutId) {
//       console.error("❌ No workout ID found. Redirecting...");
//       navigate("/past-workouts");
//       return;
//     }

//     const fetchExercises = async () => {
//       try {
//         console.log(`📡 Fetching exercises for workout ID: ${workoutId}`);

//         const workoutDoc = await getDoc(
//           doc(db, "PastWorkoutExercises", workoutId)
//         );

//         if (!workoutDoc.exists()) {
//           console.log("❌ No exercises found for this workout.");
//           setGroupedExercises({});
//         } else {
//           const workoutData = workoutDoc.data();
//           const exercises = Object.keys(workoutData).map((exerciseName) => ({
//             name: exerciseName,
//             ...workoutData[exerciseName], // Spread all exercise details
//           }));

//           // Group exercises by circuit_id
//           const grouped = exercises.reduce((acc, exercise) => {
//             const circuitId = exercise.circuit_id || "No Circuit"; // Handle missing circuit ID
//             if (!acc[circuitId]) acc[circuitId] = [];
//             acc[circuitId].push(exercise);
//             return acc;
//           }, {});

//           console.log("✅ Grouped Exercises:", grouped);
//           setGroupedExercises(grouped);
//         }
//       } catch (error) {
//         console.error("❌ Error fetching exercises:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExercises();
//   }, [workoutId, navigate]);

//   if (!workoutId) return null;

//   return (
//     <div>
//       <h2>Past Workout Exercises</h2>
//       <button onClick={() => navigate(-1)}>⬅️ Back</button>
//       {loading && <p>Loading exercises...</p>}

//       {!loading && Object.keys(groupedExercises).length === 0 && (
//         <p>No exercises recorded for this workout.</p>
//       )}

//       {Object.entries(groupedExercises).map(([circuitId, exercises]) => (
//         <div
//           key={circuitId}
//           style={{
//             marginBottom: "20px",
//             padding: "10px",
//             border: "2px solid black",
//           }}
//         >
//           <h3>
//             {circuitId === "No Circuit"
//               ? "Standalone Exercises"
//               : `Circuit ${circuitId}`}
//           </h3>
//           <ul>
//             {exercises.map((exercise, index) => (
//               <li
//                 key={index}
//                 style={{
//                   marginBottom: "10px",
//                   borderBottom: "1px solid gray",
//                   paddingBottom: "5px",
//                 }}
//               >
//                 <h4>{exercise.name}</h4>
//                 <p>
//                   <strong>Reps:</strong> {exercise.reps}
//                 </p>
//                 <p>
//                   <strong>Sets:</strong> {exercise.sets}
//                 </p>
//                 <p>
//                   <strong>Weight:</strong> {exercise.weight}
//                 </p>
//                 <p>
//                   <strong>Cues:</strong> {exercise.cues}
//                 </p>
//                 <p>
//                   <strong>Completed Sets:</strong>{" "}
//                   {exercise.completed_sets ? exercise.completed_sets.length : 0}
//                 </p>
//                 <a
//                   href={exercise.videoDemo}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   📺 Video Demo
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default IndPastWorkout;

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const IndPastWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workoutId = location.state?.workoutId;
  const [groupedExercises, setGroupedExercises] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workoutId) {
      console.error("❌ No workout ID found. Redirecting...");
      navigate("/past-workouts");
      return;
    }

    const fetchExercises = async () => {
      try {
        console.log(`📡 Fetching exercises for workout ID: ${workoutId}`);

        const workoutDoc = await getDoc(
          doc(db, "PastWorkoutExercises", workoutId)
        );

        if (!workoutDoc.exists()) {
          console.log("❌ No exercises found for this workout.");
          setGroupedExercises({});
        } else {
          const workoutData = workoutDoc.data();
          const exercises = Object.keys(workoutData).map((exerciseName) => ({
            name: exerciseName,
            ...workoutData[exerciseName], // Spread all exercise details
          }));

          // Group exercises by circuit_id
          const grouped = exercises.reduce((acc, exercise) => {
            const circuitId = exercise.circuit_id || "No Circuit"; // Handle missing circuit ID
            if (!acc[circuitId]) acc[circuitId] = [];
            acc[circuitId].push(exercise);
            return acc;
          }, {});

          console.log("✅ Grouped Exercises:", grouped);
          setGroupedExercises(grouped);
        }
      } catch (error) {
        console.error("❌ Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [workoutId, navigate]);

  if (!workoutId) return null;

  return (
    <div>
      <h2>Past Workout Exercises</h2>
      <button onClick={() => navigate(-1)}>⬅️ Back</button>
      {loading && <p>Loading exercises...</p>}

      {!loading && Object.keys(groupedExercises).length === 0 && (
        <p>No exercises recorded for this workout.</p>
      )}

      {Object.entries(groupedExercises).map(([circuitId, exercises]) => (
        <div
          key={circuitId}
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "2px solid black",
          }}
        >
          <h3>
            {circuitId === "No Circuit"
              ? "Standalone Exercises"
              : `Circuit ${circuitId}`}
          </h3>
          <ul>
            {exercises.map((exercise, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "10px",
                  borderBottom: "1px solid gray",
                  paddingBottom: "5px",
                }}
              >
                <h4>{exercise.name}</h4>
                <p>
                  <strong>Planned Reps:</strong> {exercise.reps}
                </p>
                <p>
                  <strong>Planned Sets:</strong> {exercise.sets}
                </p>
                <p>
                  <strong>Planned Weight:</strong> {exercise.weight}
                </p>
                <p>
                  <strong>Cues:</strong> {exercise.cues}
                </p>

                {/* Display Actual Performance Per Set */}
                <h5>Actual Performance:</h5>
                {exercise.actual_reps_per_set &&
                exercise.actual_weights_per_set ? (
                  <table
                    border="1"
                    cellPadding="5"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr>
                        <th>Set #</th>
                        <th>Actual Reps</th>
                        <th>Actual Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.actual_reps_per_set.map((reps, setIndex) => (
                        <tr key={setIndex}>
                          <td>{setIndex + 1}</td>
                          <td>{reps}</td>
                          <td>{exercise.actual_weights_per_set[setIndex]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No recorded actual reps/weights.</p>
                )}

                <a
                  href={exercise.videoDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📺 Video Demo
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default IndPastWorkout;
