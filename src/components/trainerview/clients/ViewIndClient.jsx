// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { db } from "../../../utils/firebase/firebaseConfig";
// import { collection, query, where, getDocs } from "firebase/firestore";

// const ViewIndClient = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const client = location.state?.client; // Get client data from navigate state
//   const [workouts, setWorkouts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Redirect if accessed without client data
//   useEffect(() => {
//     if (!client) {
//       console.error("❌ No client data found. Redirecting...");
//       navigate("/all-clients");
//     }
//   }, [client, navigate]);

//   useEffect(() => {
//     if (!client) return;

//     const fetchWorkouts = async () => {
//       try {
//         console.log(`📡 Fetching workouts for client UID: ${client.uid}`);

//         // Query CurrentWorkoutDetails where client_uid matches client's UID
//         const workoutsQuery = query(
//           collection(db, "CurrentWorkoutDetails"),
//           where("client_uid", "==", client.uid)
//         );
//         const querySnapshot = await getDocs(workoutsQuery);

//         const workoutList = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         console.log("✅ Workouts found:", workoutList);
//         setWorkouts(workoutList);
//       } catch (error) {
//         console.error("❌ Error fetching workouts:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWorkouts();
//   }, [client]);

//   if (!client) return null; // Prevents rendering if client data is missing

//   return (
//     <div>
//       <h2>Workouts for {client.name}</h2>
//       <p>
//         <strong>Email:</strong> {client.email}
//       </p>

//       <button
//         onClick={() =>
//           navigate("/create-workout", { state: { client_uid: client.uid } })
//         }
//       >
//         Add Workout
//       </button>

//       {loading && <p>Loading workouts...</p>}

//       {workouts.length === 0 && !loading && (
//         <p>No workouts assigned to this client.</p>
//       )}

//       <ul>
//         {workouts.map((workout) => (
//           <li key={workout.id}>
//             {/* ✅ Clicking workout name navigates to `ViewIndWorkout.jsx` with `exercise_doc_id` */}
//             <h3
//               style={{
//                 cursor: "pointer",
//                 color: "blue",
//                 textDecoration: "underline",
//               }}
//               onClick={() =>
//                 navigate("/workout-details", {
//                   state: { exercise_doc_id: workout.exercise_doc_id },
//                 })
//               }
//             >
//               {workout.workout_name}
//             </h3>
//             <p>
//               <strong>Exercise Doc ID:</strong> {workout.exercise_doc_id}
//             </p>
//             <p>
//               <strong>Notes:</strong> {workout.notes}
//             </p>
//             <p>
//               <strong>Trainer UID:</strong> {workout.trainer_uid}
//             </p>
//             <hr />
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ViewIndClient;

//
//
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

const ViewIndClient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const client = location.state?.client; // Client data from navigation
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Redirect if no client data
  useEffect(() => {
    if (!client) {
      console.error("❌ No client data found. Redirecting...");
      navigate("/all-clients");
    }
  }, [client, navigate]);

  // 🔥 Fetch the client's workouts
  useEffect(() => {
    if (!client) return;

    const fetchWorkouts = async () => {
      try {
        console.log(`📡 Fetching workouts for client UID: ${client.uid}`);

        const workoutsQuery = query(
          collection(db, "CurrentWorkoutDetails"),
          where("client_uid", "==", client.uid)
        );
        const querySnapshot = await getDocs(workoutsQuery);

        const workoutList = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Doc ID from Firestore
          ...doc.data(), // workout_name, exercise_doc_id, notes, trainer_uid, etc.
        }));

        console.log("✅ Workouts found:", workoutList);
        setWorkouts(workoutList);
      } catch (error) {
        console.error("❌ Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [client]);

  // 🔥 Delete the workout from Firestore (both details & exercises)
  const handleDeleteWorkout = async (workoutId, exerciseDocId) => {
    try {
      // 1. Remove from CurrentWorkoutDetails
      await deleteDoc(doc(db, "CurrentWorkoutDetails", workoutId));
      // 2. Remove from CurrentWorkoutExercises
      await deleteDoc(doc(db, "CurrentWorkoutExercises", exerciseDocId));

      // 3. Remove from local state
      setWorkouts((prevWorkouts) =>
        prevWorkouts.filter((w) => w.id !== workoutId)
      );

      console.log("✅ Workout deleted from Firestore:", workoutId);
    } catch (error) {
      console.error("❌ Error deleting workout:", error);
    }
  };

  if (!client) return null;

  return (
    <div>
      <h2>Workouts for {client.name}</h2>
      <p>
        <strong>Email:</strong> {client.email}
      </p>

      <button
        onClick={() =>
          navigate("/create-workout", { state: { client_uid: client.uid } })
        }
      >
        Add Workout
      </button>

      {loading && <p>Loading workouts...</p>}

      {!loading && workouts.length === 0 && (
        <p>No workouts assigned to this client.</p>
      )}

      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            {/* ✅ Clicking workout name navigates to `ViewIndWorkout.jsx` */}
            <h3
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() =>
                navigate("/workout-details", {
                  state: { exercise_doc_id: workout.exercise_doc_id },
                })
              }
            >
              {workout.workout_name}
            </h3>
            <p>
              <strong>Exercise Doc ID:</strong> {workout.exercise_doc_id}
            </p>
            <p>
              <strong>Notes:</strong> {workout.notes}
            </p>
            <p>
              <strong>Trainer UID:</strong> {workout.trainer_uid}
            </p>

            {/* 🔥 Delete button */}
            <button
              onClick={() =>
                handleDeleteWorkout(workout.id, workout.exercise_doc_id)
              }
              style={{ marginTop: "5px" }}
            >
              ❌ Delete Workout
            </button>

            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewIndClient;
