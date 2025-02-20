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

  // 🔥 Group exercises by circuit_id, but keep standalone exercises separate
  const groupedExercises = exercises.reduce((groups, exercise) => {
    if (!exercise.circuit_id) {
      // Treat standalone exercises separately
      groups[exercise.name] = [exercise];
    } else {
      // Group exercises with the same circuit_id
      if (!groups[exercise.circuit_id]) {
        groups[exercise.circuit_id] = [];
      }
      groups[exercise.circuit_id].push(exercise);
    }
    return groups;
  }, {});

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

        {/* 🔥 Render exercises grouped by circuits */}
        {Object.entries(groupedExercises).map(([groupId, exercises]) => (
          <div
            key={groupId}
            style={{
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "3rem",
              background: "#FDF8F6",
            }}
            className="exercise_block"
          >
            {/* Show 🔥 Circuit only if the groupId is a circuit_id and not a standalone exercise name */}
            {groupId.length > 10 && <h3>🔥 Circuit</h3>}

            {exercises.map((exercise, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <h3>{exercise.name}</h3>
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
                <p>
                  <strong>Sets:</strong> {exercise.sets} <strong>Reps:</strong>{" "}
                  {exercise.reps} <strong>Weight:</strong> {exercise.weight} lbs
                </p>

                <p>
                  <strong>Cues:</strong> {exercise.cues}
                </p>

                {index !== exercises.length - 1 && <hr id="hr" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewIndWorkout;
