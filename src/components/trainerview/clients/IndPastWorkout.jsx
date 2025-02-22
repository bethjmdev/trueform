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

  // ✅ Step 1: Identify first index of each circuit
  const circuitIndexMap = {};

  // ✅ Step 2: Convert `workoutDetails` to an array and sort by index
  const sortedExercises = Object.entries(workoutDetails)
    .map(([exercise, details]) => ({
      exercise,
      ...details,
    }))
    .sort((a, b) => {
      const indexA = a.circuit_id
        ? circuitIndexMap[a.circuit_id] ?? a.index
        : a.index;
      const indexB = b.circuit_id
        ? circuitIndexMap[b.circuit_id] ?? b.index
        : b.index;
      return indexA - indexB;
    });

  // ✅ Step 3: Group circuits together while keeping everything in one ordered list
  const groupedExercises = [];
  const seenCircuits = new Set();

  sortedExercises.forEach((exercise) => {
    if (exercise.circuit_id) {
      if (!seenCircuits.has(exercise.circuit_id)) {
        groupedExercises.push({
          type: "circuit",
          circuit_id: exercise.circuit_id,
          exercises: sortedExercises.filter(
            (e) => e.circuit_id === exercise.circuit_id
          ),
        });
        seenCircuits.add(exercise.circuit_id);
      }
    } else {
      groupedExercises.push({
        type: "exercise",
        ...exercise,
      });
    }
  });

  console.log("workoutDetails", workoutDetails);

  return (
    <div className="ViewIndWorkout">
      <div className="view_ind_workout_container">
        <h2>Past Workout Details</h2>

        {/* ✅ Render Exercises & Circuits in Order */}
        {groupedExercises.map((group) => {
          return (
            <div
              key={group.type === "circuit" ? group.circuit_id : group.exercise}
              style={{
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "3rem",
                background: "#FDF8F6",
              }}
              className="exercise_block"
            >
              {group.type === "circuit" && <h3>🔥 Circuit</h3>}

              {group.type === "circuit"
                ? group.exercises.map((details) => (
                    <div
                      key={details.exercise}
                      style={{ marginBottom: "10px" }}
                    >
                      <h3>{details.exercise}</h3>
                      <p>
                        <strong>Cues:</strong> {details.cues}
                      </p>
                      {details.videoDemo && (
                        <p>
                          <a
                            href={details.videoDemo}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#213547", cursor: "pointer" }}
                          >
                            Click to View Video Demo
                          </a>
                        </p>
                      )}
                      <p>
                        <strong>Planned...</strong>
                      </p>
                      <p>
                        <strong>Reps:</strong> {details.reps}{" "}
                        <strong>Sets:</strong> {details.sets},{" "}
                        <strong>Weight:</strong> {details.weight} lbs
                        <br />
                        <strong>Tempo</strong>{" "}
                        {details.tempo ? details.tempo : "No Tempo"}{" "}
                        <strong>Tempo Length</strong>{" "}
                        {details.tempoLength ? details.tempoLength : "No Tempo"}
                      </p>
                      <p>
                        <strong>Actual Performance...</strong>
                      </p>
                      {details.actual_reps_per_set &&
                      details.actual_weights_per_set ? (
                        <table
                          border="1"
                          cellPadding="5"
                          style={{
                            borderCollapse: "collapse",
                            width: "100%",
                          }}
                        >
                          <thead>
                            <tr>
                              <th>Set #</th>
                              <th>Actual Reps</th>
                              <th>Actual Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.actual_reps_per_set.map(
                              (reps, setIndex) => (
                                <tr key={setIndex}>
                                  <td>{setIndex + 1}</td>
                                  <td>{reps}</td>
                                  <td>
                                    {details.actual_weights_per_set[setIndex]}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <p>No recorded actual reps/weights.</p>
                      )}
                    </div>
                  ))
                : // Single Exercise (Non-Circuit)
                  (() => {
                    const details = group;
                    return (
                      <div key={details.exercise}>
                        <h3>{details.exercise}</h3>
                        <p>
                          <strong>Cues:</strong> {details.cues}
                        </p>
                        {details.videoDemo && (
                          <p>
                            <a
                              href={details.videoDemo}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#213547", cursor: "pointer" }}
                            >
                              Click to View Video Demo
                            </a>
                          </p>
                        )}
                        <p>
                          <strong>Planned...</strong>
                        </p>
                        <p>
                          <strong>Reps:</strong> {details.reps}{" "}
                          <strong>Sets:</strong> {details.sets},{" "}
                          <strong>Weight:</strong> {details.weight} lbs
                          <br />
                          <strong>Tempo</strong>{" "}
                          {details.tempo ? details.tempo : "No Tempo"}{" "}
                          <strong>Tempo Length</strong>{" "}
                          {details.tempoLength
                            ? details.tempoLength
                            : "No Tempo"}
                        </p>
                        <p>
                          <strong>Actual Performance...</strong>
                        </p>
                        {details.actual_reps_per_set &&
                        details.actual_weights_per_set ? (
                          <table
                            border="1"
                            cellPadding="5"
                            style={{
                              borderCollapse: "collapse",
                              width: "100%",
                            }}
                          >
                            <thead>
                              <tr>
                                <th>Set #</th>
                                <th>Actual Reps</th>
                                <th>Actual Weight</th>
                              </tr>
                            </thead>
                            <tbody>
                              {details.actual_reps_per_set.map(
                                (reps, setIndex) => (
                                  <tr key={setIndex}>
                                    <td>{setIndex + 1}</td>
                                    <td>{reps}</td>
                                    <td>
                                      {details.actual_weights_per_set[setIndex]}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        ) : (
                          <p>No recorded actual reps/weights.</p>
                        )}
                      </div>
                    );
                  })()}
            </div>
          );
        })}

        {/* Back Button */}
        <button onClick={handleBack} id="button">
          Back
        </button>
      </div>
    </div>
  );
};

export default IndClientPastWorkout;
