import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import "../trainerview/clients/ViewIndWorkout.css";

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

  // ✅ Group exercises by circuit_id while keeping standalone exercises separate
  const groupedExercises = {};
  const nonCircuitExercises = [];

  Object.entries(workoutDetails).forEach(([exercise, details]) => {
    if (details.circuit_id && details.circuit_id.trim() !== "") {
      if (!groupedExercises[details.circuit_id]) {
        groupedExercises[details.circuit_id] = [];
      }
      groupedExercises[details.circuit_id].push([exercise, details]);
    } else {
      nonCircuitExercises.push([exercise, details]);
    }
  });

  return (
    <div className="ViewIndWorkout">
      <div className="view_ind_workout_container">
        {workout_name && <h2>Workout {workout_name}</h2>}

        {/* Start Button */}
        <button onClick={handleStartWorkout} id="button">
          Start Workout
        </button>

        {/* ✅ Render Circuit Groups */}

        {Object.entries(groupedExercises).map(([circuit_id, exercises]) => (
          <div
            key={circuit_id}
            style={{
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "3rem",
              background: "#FDF8F6",
            }}
            className="exercise_block"
          >
            {circuit_id.length > 10 && <h3>🔥 Circuit</h3>}

            {exercises.map(([exercise, details], index) => {
              const isLastExercise = index === exercises.length - 1;

              return (
                <div key={exercise} style={{ marginBottom: "10px" }}>
                  <h3>{exercise}</h3>
                  {details.videoDemo && (
                    // <p>
                    //   <strong>Video Demo:</strong>{" "}
                    //   <a
                    //     href={details.videoDemo}
                    //     target="_blank"
                    //     rel="noopener noreferrer"
                    //   >
                    //     {details.videoDemo}
                    //   </a>
                    // </p>

                    <p>
                      <a
                        href={exercise.videoDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#213547",
                          cursor: "pointer",
                        }}
                      >
                        Click to View Video Demo
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

                  {!isLastExercise && <hr />}
                </div>
              );
            })}
          </div>
        ))}

        {/* ✅ Render Non-Circuit Exercises (Standalone) */}
        {nonCircuitExercises.length > 0 && (
          <div>
            {nonCircuitExercises.map(([exercise, details]) => (
              <div
                key={exercise}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "3rem",
                  background: "#FDF8F6",
                }}
                className="exercise_block"
              >
                <h3>{exercise}</h3>
                {details.videoDemo && (
                  <p>
                    <a
                      href={exercise.videoDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#213547",
                        cursor: "pointer",
                      }}
                    >
                      Click to View Video Demo
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
        )}
      </div>
    </div>
  );
};

export default SingleWorkout;
