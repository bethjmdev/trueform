import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

import "./PastWorkouts.css";

const PastWorkouts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const client = location.state?.client;
  const [pastWorkouts, setPastWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      console.error("❌ No client data found. Redirecting...");
      navigate("/all-clients");
      return;
    }

    // const fetchPastWorkouts = async () => {
    //   try {
    //     console.log(`📡 Fetching past workouts for client UID: ${client.uid}`);

    //     const pastWorkoutsQuery = query(
    //       collection(db, "PastWorkoutDetails"),
    //       where("uid", "==", client.uid) // 🔍 Match client's UID
    //     );

    //     const querySnapshot = await getDocs(pastWorkoutsQuery);

    //     const workoutList = querySnapshot.docs.map((doc) => ({
    //       id: doc.id,
    //       ...doc.data(),
    //     }));

    //     console.log("✅ Past workouts found:", workoutList);
    //     setPastWorkouts(workoutList);
    //   } catch (error) {
    //     console.error("❌ Error fetching past workouts:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchPastWorkouts = async () => {
      try {
        console.log(`📡 Fetching past workouts for client UID: ${client.uid}`);

        const pastWorkoutsQuery = query(
          collection(db, "PastWorkoutDetails"),
          where("uid", "==", client.uid) // No orderBy to avoid index requirement
        );

        const querySnapshot = await getDocs(pastWorkoutsQuery);

        let workoutList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort manually by timestamp in descending order (newest first)
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
  }, [client, navigate]);

  if (!client) return null;

  return (
    <div className="PastWorkouts">
      <div className="past_workout_container">
        <h2>Past Workouts for {client.name}</h2>
        {/* <button onClick={() => navigate(-1)}>⬅️ Back</button> */}
        {loading && <p>Loading past workouts...</p>}

        {!loading && pastWorkouts.length === 0 && (
          <p>No past workouts recorded for this client.</p>
        )}

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
                  navigate("/ind-past-workout", {
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
      </div>
    </div>
  );
};

export default PastWorkouts;
