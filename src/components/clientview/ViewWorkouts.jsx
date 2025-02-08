// import { auth } from "../../utils/firebase/firebaseConfig";

// import { useAuth } from "../../utils/auth/AuthProvider";

// const ViewWorkouts = () => {
//   const user = useAuth();

//   return (
//     <div>
//       <p>hey there!!!</p>
//     </div>
//   );
// };

// export default ViewWorkouts;

import { useState, useEffect } from "react";
import { useAuth } from "../../utils/auth/AuthProvider";
import { db } from "../../utils/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ViewWorkouts = () => {
  const { user } = useAuth(); // 🔥 Get logged-in client
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchClientWorkouts = async () => {
      try {
        console.log(`📡 Fetching workouts for client UID: ${user.uid}`);

        // 🔥 Query Firestore to find workouts assigned to this client
        const workoutsQuery = query(
          collection(db, "CurrentWorkoutDetails"),
          where("client_uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(workoutsQuery);

        const workoutList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("✅ Workouts found:", workoutList);
        setWorkouts(workoutList);
      } catch (error) {
        console.error("❌ Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientWorkouts();
  }, [user]);

  if (!user) return <p>You must be logged in to view workouts.</p>;

  return (
    <div>
      <h2>Your Workouts</h2>

      {loading && <p>Loading workouts...</p>}

      {workouts.length === 0 && !loading && (
        <p>You have no assigned workouts yet.</p>
      )}

      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            <h3
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() =>
                navigate("/view-workout", {
                  state: { exercise_doc_id: workout.exercise_doc_id },
                })
              }
            >
              {workout.workout_name}
            </h3>
            <p>
              <strong>Notes:</strong> {workout.notes}
            </p>
            <p>
              <strong>Trainer UID:</strong> {workout.trainer_uid}
            </p>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewWorkouts;
