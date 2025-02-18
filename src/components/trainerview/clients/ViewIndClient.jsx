import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import "./ViewIndClient.css";

const ViewIndClient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const client = location.state?.client; // Get client data from navigate state
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const workoutLimit = 7; // Maximum number of workouts per client

  // Redirect if accessed without client data
  useEffect(() => {
    if (!client) {
      console.error("❌ No client data found. Redirecting...");
      navigate("/all-clients");
    }
  }, [client, navigate]);

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

    fetchWorkouts();
  }, [client]);

  const handleAddWorkout = () => {
    if (workouts.length >= workoutLimit) {
      alert(
        `Maximum of ${workoutLimit} workouts reached. Please delete a workout to add another.`
      );
      return;
    }
    navigate("/create-workout", { state: { client_uid: client.uid } });
  };

  const handleDeleteWorkout = async (workoutId, exerciseDocId) => {
    try {
      await deleteDoc(doc(db, "CurrentWorkoutDetails", workoutId));
      await deleteDoc(doc(db, "CurrentWorkoutExercises", exerciseDocId));

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
    <div className="ViewIndWorkout">
      <div className="view_ind_workout_container">
        <h2>Workouts for {client.name}</h2>
        <p>
          <strong>Email:</strong> {client.email}
        </p>

        <button onClick={handleAddWorkout}>Add Workout</button>
        <button
          onClick={() => navigate("/past-workouts", { state: { client } })}
        >
          View Past Workouts
        </button>
        {loading && <p>Loading workouts...</p>}

        {!loading && workouts.length === 0 && (
          <p>No workouts assigned to this client.</p>
        )}

        <ul>
          {workouts.map((workout) => (
            <li key={workout.id} className="ind_workout_container">
              <h3
                // style={{
                //   cursor: "pointer",
                //   color: "blue",
                //   textDecoration: "underline",
                // }}
                onClick={() =>
                  navigate("/workout-details", {
                    state: { exercise_doc_id: workout.exercise_doc_id },
                  })
                }
              >
                {workout.workout_name}
              </h3>

              <p>
                <strong>Notes:</strong> {workout.notes}
              </p>

              <button
                onClick={() =>
                  handleDeleteWorkout(workout.id, workout.exercise_doc_id)
                }
              >
                ❌ Delete Workout
              </button>
              <hr />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ViewIndClient;
