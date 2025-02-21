import { useState, useEffect } from "react";
import { useAuth } from "../../utils/auth/AuthProvider";
import { db } from "../../utils/firebase/firebaseConfig";
// import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

const ClientPastWorkouts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pastWorkouts, setPastWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.uid) return;

    const fetchPastWorkouts = async () => {
      try {
        console.log(`📡 Fetching past workouts for client UID: ${user.uid}`);

        // Fetch PastWorkoutDetails
        const pastWorkoutsQuery = query(
          collection(db, "PastWorkoutDetails"),
          where("uid", "==", user.uid)
        );
        const detailsSnapshot = await getDocs(pastWorkoutsQuery);

        let workoutList = detailsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch PastWorkoutExercises for each workout
        for (let workout of workoutList) {
          const exercisesDocRef = doc(db, "PastWorkoutExercises", workout.id);
          const exercisesDoc = await getDoc(exercisesDocRef);

          if (exercisesDoc.exists()) {
            workout.exercises = Object.values(
              exercisesDoc.data().exercises || {}
            );
          } else {
            workout.exercises = [];
          }
        }

        // Sort workouts by timestamp (newest first)
        workoutList.sort(
          (a, b) =>
            (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0)
        );

        console.log("✅ Past workouts found:", workoutList);
        setPastWorkouts(workoutList);
      } catch (error) {
        console.error("❌ Error fetching past workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastWorkouts();
  }, [user?.uid]);

  if (!user) return <p>You must be logged in to view past workouts.</p>;

  return (
    <div className="PastWorkouts">
      <div className="past_workout_container">
        <h2>Your Past Workouts</h2>

        {loading ? (
          <p>Loading past workouts...</p>
        ) : pastWorkouts.length === 0 ? (
          <p>No past workouts recorded yet.</p>
        ) : (
          <ul>
            {pastWorkouts.map((workout) => {
              const timestamp = workout.timestamp?.toDate
                ? workout.timestamp.toDate()
                : workout.timestamp;
              const formattedDate = timestamp
                ? new Date(timestamp).toLocaleString()
                : "Unknown Date";

              const totalSeconds = workout.duration_seconds || 0;
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = totalSeconds % 60;

              return (
                <li
                  key={workout.id}
                  className="ind_past_workout"
                  onClick={() =>
                    navigate("/client-ind-past-workout", {
                      state: { workoutId: workout.id },
                    })
                  }
                >
                  <h3>{workout.workout_name}</h3>
                  <p>
                    <strong>Date:</strong> {formattedDate}
                  </p>
                  <p>
                    <strong>Duration:</strong> {minutes} min {seconds} sec
                  </p>

                  {/* ✅ Display Exercises Correctly */}
                  <h4>Exercises:</h4>
                  <ul>
                    {workout.exercises.length > 0 ? (
                      workout.exercises.map((exercise, index) => (
                        <li key={index}>
                          <p>
                            <strong>{exercise.name}</strong>
                          </p>
                          <p>
                            <strong>Planned Reps:</strong>{" "}
                            {exercise.planned_reps || "N/A"}
                          </p>
                          <p>
                            <strong>Planned Weight:</strong>{" "}
                            {exercise.planned_weight || "N/A"} lbs
                          </p>
                          <p>
                            <strong>Actual Reps:</strong>{" "}
                            {exercise.actual_reps_per_set?.length
                              ? exercise.actual_reps_per_set.join(", ")
                              : "No recorded data"}
                          </p>
                          <p>
                            <strong>Actual Weight:</strong>{" "}
                            {exercise.actual_weights_per_set?.length
                              ? exercise.actual_weights_per_set.join(", ")
                              : "No recorded data"}{" "}
                            lbs
                          </p>
                          <p>
                            <strong>Completed:</strong>{" "}
                            {exercise.completed_sets?.includes(true)
                              ? "✅"
                              : "❌"}
                          </p>
                        </li>
                      ))
                    ) : (
                      <p>No recorded exercises.</p>
                    )}
                  </ul>

                  <hr />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientPastWorkouts;
