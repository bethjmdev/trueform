import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./ViewIndWorkout.css";

const IndClientPastWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workoutId = location.state?.workoutId;
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workoutId) return;

    const fetchExercises = async () => {
      try {
        console.log(`📡 Fetching exercises for workout ID: ${workoutId}`);
        const workoutDoc = await getDoc(
          doc(db, "PastWorkoutExercises", workoutId)
        );

        if (workoutDoc.exists()) {
          console.log("✅ Workout details loaded:", workoutDoc.data());
          setWorkoutDetails(workoutDoc.data());
        } else {
          console.error("❌ No exercises found.");
        }
      } catch (error) {
        console.error("❌ Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [workoutId]);

  if (loading) return <p>Loading exercises...</p>;
  if (!workoutDetails) return <p>No exercises found for this workout.</p>;

  const handleBack = () => {
    navigate(-1);
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

  console.log("workoutDetails", workoutDetails);

  return (
    <div className="ViewIndWorkout">
      <div className="view_ind_workout_container">
        <h2>Past Workout Details</h2>

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
                  <p>
                    <strong>Cues:</strong> {details.cues}
                  </p>
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
                    <strong>Planned...</strong>
                  </p>
                  <p>
                    <strong>Reps:</strong> {details.reps} <strong>Sets:</strong>{" "}
                    {details.sets}, <strong>Weight:</strong> {details.weight}{" "}
                    lbs
                  </p>
                  {/* <p>
                    <strong>Planned Sets:</strong> {details.sets}
                  </p>
                  <p>
                    <strong>Planned Weight:</strong> {details.weight} lbs
                  </p> */}

                  {/* Display Actual Performance Per Set */}
                  <p>
                    <strong>Actual Performance...</strong>
                  </p>
                  {details.actual_reps_per_set &&
                  details.actual_weights_per_set ? (
                    <table
                      border="1"
                      cellPadding="5"
                      style={{ borderCollapse: "collapse", width: "100%" }}
                    >
                      <thead>
                        <tr>
                          <th>Set #</th>
                          <th>Actual Reps</th>
                          <th>Actual Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.actual_reps_per_set.map((reps, setIndex) => (
                          <tr key={setIndex}>
                            <td>{setIndex + 1}</td>
                            <td>{reps}</td>
                            <td>{details.actual_weights_per_set[setIndex]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No recorded actual reps/weights.</p>
                  )}
                  <br />
                  {!isLastExercise && <hr id="hr" />}
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
                      href={details.videoDemo}
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
                  <strong>Planned Reps:</strong> {details.reps}
                </p>
                <p>
                  <strong>Planned Sets:</strong> {details.sets}
                </p>
                <p>
                  <strong>Planned Weight:</strong> {details.weight} lbs
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

export default IndClientPastWorkout;
