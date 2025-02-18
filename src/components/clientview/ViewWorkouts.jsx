import { useState, useEffect } from "react";
import { useAuth } from "../../utils/auth/AuthProvider";
import { db } from "../../utils/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "./ViewWorkouts.css";

const ViewWorkouts = () => {
  const { user } = useAuth(); // ✅ Ensure correct destructuring
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.uid) return; // ✅ Ensures user is fully loaded

    const fetchClientWorkouts = async () => {
      try {
        console.log(`📡 Fetching workouts for client UID: ${user.uid}`);

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
  }, [user?.uid]); // ✅ Ensures useEffect runs only when user.uid is available

  if (!user) return <p>You must be logged in to view workouts.</p>;

  return (
    <div className="ViewWorkout">
      <div className="view-workouts-container">
        <h2>Your Workouts</h2>

        {loading ? (
          <p>Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <p>You have no assigned workouts yet.</p>
        ) : (
          <ul>
            {workouts.map((workout) => (
              <li key={workout.id} className="workout_container">
                <h3
                  onClick={() =>
                    navigate("/single-workout", {
                      state: {
                        exercise_doc_id: workout.exercise_doc_id,
                        workout_name: workout.workout_name,
                        trainer: workout.trainer_uid,
                      },
                    })
                  }
                >
                  {workout.workout_name}
                </h3>
                {/* <p>
                  <strong>Notes:</strong> {workout.notes}
                </p> */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewWorkouts;
