import { useState, useEffect } from "react";
import { useAuth } from "../../utils/auth/AuthProvider";
import { db } from "../../utils/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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

        const pastWorkoutsQuery = query(
          collection(db, "PastWorkoutDetails"),
          where("uid", "==", user.uid) // Match logged-in client UID
        );

        const querySnapshot = await getDocs(pastWorkoutsQuery);

        const workoutList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort workouts by timestamp in descending order (most recent first)
        const sortedWorkoutList = workoutList.sort((a, b) => {
          const timestampA = a.timestamp?.toDate
            ? a.timestamp.toDate()
            : new Date(0);
          const timestampB = b.timestamp?.toDate
            ? b.timestamp.toDate()
            : new Date(0);
          return timestampB - timestampA;
        });

        console.log("✅ Past workouts found:", sortedWorkoutList);
        setPastWorkouts(sortedWorkoutList);
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
                : null;
              const formattedDate = timestamp
                ? timestamp.toLocaleString()
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
