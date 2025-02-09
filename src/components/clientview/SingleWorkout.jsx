import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const SingleWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exercise_doc_id = location.state?.exercise_doc_id;
  const workout_name = location.state?.workout_name;

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
    navigate("/start-workout", { state: { workoutDetails, workout_name } });
  };

  return (
    <div>
      <h2>Workout Details</h2>
      {Object.entries(workoutDetails).map(([exercise, details], index) => (
        <div key={index}>
          <h3>{exercise}</h3>
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
          {details.circuit_id && <p>🔥 Circuit</p>}
          <hr />
        </div>
      ))}

      {/* Start Button */}
      <button onClick={handleStartWorkout}>Start</button>
    </div>
  );
};

export default SingleWorkout;
