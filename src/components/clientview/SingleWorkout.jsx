import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const SingleWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exercise_doc_id = location.state?.exercise_doc_id;
  const workout_name = location.state?.workout_name;
  const trainer = location.state?.trainer;

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

  const handleStartWorkout = () => {
    navigate("/start-workout", {
      state: { workoutDetails, workout_name, trainer },
    });
  };

  // ✅ Group exercises by circuit_id
  const groupedExercises = {};
  const nonCircuitExercises = [];

  Object.entries(workoutDetails).forEach(([exercise, details]) => {
    if (details.circuit_id) {
      if (!groupedExercises[details.circuit_id]) {
        groupedExercises[details.circuit_id] = [];
      }
      groupedExercises[details.circuit_id].push([exercise, details]);
    } else {
      nonCircuitExercises.push([exercise, details]);
    }
  });

  return (
    <div>
      <h2>Workout Details</h2>
      {workout_name && <h3>Workout: {workout_name}</h3>}

      {/* Start Button */}
      <button onClick={handleStartWorkout} style={{ marginTop: "20px" }}>
        Start Workout
      </button>

      {/* ✅ Render Circuit Groups */}
      {Object.entries(groupedExercises).map(([circuit_id, exercises]) => (
        <div
          key={circuit_id}
          style={{
            border: "2px solid #000",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          <h3>🔥 Circuit</h3>
          {exercises.map(([exercise, details]) => (
            <div key={exercise}>
              <h3>{exercise}</h3>
              {details.videoDemo && (
                <p>
                  <strong>Video Demo:</strong>{" "}
                  <a
                    href={details.videoDemo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {details.videoDemo}
                  </a>
                </p>
              )}
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
            </div>
          ))}
        </div>
      ))}

      {/* ✅ Render Non-Circuit Exercises */}
      {nonCircuitExercises.map(([exercise, details]) => (
        <div key={exercise} style={{ marginTop: "20px" }}>
          <h3>{exercise}</h3>
          {details.videoDemo && (
            <p>
              <strong>Video Demo:</strong>{" "}
              <a
                href={details.videoDemo}
                target="_blank"
                rel="noopener noreferrer"
              >
                {details.videoDemo}
              </a>
            </p>
          )}
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
        </div>
      ))}
    </div>
  );
};

export default SingleWorkout;
