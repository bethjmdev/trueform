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
    console.log("🚀 Navigating with workout details:", workoutDetails);
    navigate("/start-workout", {
      state: { workoutDetails, workout_name, trainer },
    });
  };

  const sortedExercises = workoutDetails.exercises || []; // Always ensure it's an array

  const groupedExercises = [];
  const seenCircuits = new Map(); // Use a Map for better tracking

  sortedExercises.forEach((exercise) => {
    if (exercise.circuit_id) {
      if (!seenCircuits.has(exercise.circuit_id)) {
        seenCircuits.set(exercise.circuit_id, {
          type: "circuit",
          circuit_id: exercise.circuit_id,
          exercises: [],
        });
        groupedExercises.push(seenCircuits.get(exercise.circuit_id));
      }
      seenCircuits.get(exercise.circuit_id).exercises.push(exercise);
    } else {
      groupedExercises.push({ type: "exercise", ...exercise });
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

        {/* ✅ Render Exercises & Circuits in Order */}
        {groupedExercises.map((group) => {
          if (group.type === "circuit") {
            return (
              <div
                key={group.circuit_id}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "3rem",
                  background: "#FDF8F6",
                }}
                className="exercise_block"
              >
                <h3>🔥 Circuit</h3>
                {group.exercises.map((details) => (
                  <div key={details.exercise}>
                    <h3>{details.exercise}</h3>

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
                      <strong>Note:</strong> {group.note}
                    </p>
                    <p>
                      <strong>Sets:</strong> {details.sets}
                    </p>
                    <p>
                      <strong>Reps:</strong> {details.reps}
                    </p>

                    <p>
                      <strong>Tempo:</strong> {group.tempo}
                    </p>
                    <p>
                      <strong>Tempo Length:</strong> {group.tempoLength}
                    </p>

                    <p>
                      <strong>Weight:</strong> {details.weight} lbs
                    </p>
                  </div>
                ))}
              </div>
            );
          } else {
            return (
              <div
                key={group.exercise}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "3rem",
                  background: "#FDF8F6",
                }}
                className="exercise_block"
              >
                <h3>{group.exercise}</h3>
                {group.videoDemo && (
                  <p>
                    <a
                      href={group.videoDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#213547", cursor: "pointer" }}
                    >
                      Click to View Video Demo
                    </a>
                  </p>
                )}
                {/* 
                <p>
                  <strong>Reps:</strong> {group.reps}
                </p>
                <p>
                  <strong>Sets:</strong> {group.sets}
                </p> */}
                <p>
                  <strong>Note:</strong> {group.note}
                </p>
                <p>
                  <strong>Sets:</strong> {group.sets}
                </p>
                <p>
                  <strong>Reps:</strong> {group.reps}
                </p>

                <p>
                  <strong>Tempo:</strong> {group.tempo}
                </p>
                <p>
                  <strong>Tempo Length:</strong> {group.tempoLength}
                </p>
                <p>
                  <strong>Weight:</strong> {group.weight} lbs
                </p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default SingleWorkout;
