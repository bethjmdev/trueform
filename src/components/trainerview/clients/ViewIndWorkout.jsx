import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import "./ViewIndWorkout.css";

const ViewIndWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exercise_doc_id = location.state?.exercise_doc_id; // Get exercise_doc_id from navigation state
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if accessed without exercise_doc_id
  useEffect(() => {
    if (!exercise_doc_id) {
      console.error("❌ No exercise_doc_id found. Redirecting...");
      navigate("/all-clients");
    }
  }, [exercise_doc_id, navigate]);

  useEffect(() => {
    if (!exercise_doc_id) return;

    const fetchExerciseDetails = async () => {
      try {
        console.log(
          `📡 Fetching exercise details for doc ID: ${exercise_doc_id}`
        );

        // Get the document from CurrentWorkoutExercises where ID matches exercise_doc_id
        const exerciseRef = doc(db, "CurrentWorkoutExercises", exercise_doc_id);
        const exerciseSnap = await getDoc(exerciseRef);

        if (exerciseSnap.exists()) {
          console.log("✅ Exercise details found:", exerciseSnap.data());

          // Convert object to array
          const exerciseData = exerciseSnap.data();
          const exerciseArray = Object.entries(exerciseData).map(
            ([name, details]) => ({
              name,
              ...details,
            })
          );

          setExercises(exerciseArray);
        } else {
          console.error("❌ No exercise found for this ID.");
        }
      } catch (error) {
        console.error("❌ Error fetching exercise details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [exercise_doc_id]);

  if (!exercise_doc_id) return null; // Prevents rendering if no ID is found

  // ✅ Step 1: Identify first index of each circuit
  const circuitIndexMap = {};

  // ✅ Step 2: Convert `exercises` to an array and sort by index
  const sortedExercises = exercises
    .map((exercise) => ({
      ...exercise,
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

  return (
    <div className="ViewIndWorkout">
      <div className="view_ind_workout_container">
        <h2>Workout Exercise Details</h2>

        {/* Edit Workout Button */}
        <button
          id="button"
          onClick={() =>
            navigate("/edit-workout", { state: { exercise_doc_id } })
          }
        >
          Edit Workout
        </button>

        {loading && <p>Loading exercise details...</p>}

        {!loading && exercises.length === 0 && (
          <p>No exercise details found.</p>
        )}

        {/* ✅ Render Exercises & Circuits in Order */}
        {groupedExercises.map((group) => {
          return (
            <div
              key={group.type === "circuit" ? group.circuit_id : group.name}
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
                    <div key={details.name} style={{ marginBottom: "10px" }}>
                      <h3>{details.name}</h3>
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
                        <strong>Sets:</strong> {details.sets}{" "}
                        <strong>Reps:</strong> {details.reps}{" "}
                        <strong>Tempo</strong>{" "}
                        {details.tempo ? details.tempo : "No Tempo"}{" "}
                        <strong>Tempo</strong>
                        {details.tempoLength ? details.tempoLength : "No Tempo"}
                        <strong>Weight:</strong> {details.weight} lbs
                      </p>
                      <p>
                        <strong>Cues:</strong> {details.cues}
                      </p>
                    </div>
                  ))
                : // Single Exercise (Non-Circuit)
                  (() => {
                    const details = group;
                    return (
                      <div key={details.name}>
                        <h3>{details.name}</h3>
                        <strong>Notes</strong> {details.notes}{" "}
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
                          <strong>Sets:</strong> {details.sets}{" "}
                          <strong>Reps:</strong> {details.reps}{" "}
                          <strong>Weight:</strong> {details.weight} lbs
                          <br />
                          <strong>Tempo</strong>{" "}
                          {details.tempo ? details.tempo : "No Tempo"}{" "}
                          <strong>Tempo</strong>{" "}
                          {details.tempoLength
                            ? details.tempoLength
                            : "No Tempo"}
                        </p>
                        <p>
                          <strong>Cues:</strong> {details.cues}
                        </p>
                      </div>
                    );
                  })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewIndWorkout;
