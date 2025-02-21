import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import "./ExerciseDatabase.css";

function ExerciseDatabase() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ExerciseDatabase"));
        const exerciseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExercises(exerciseList);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  return (
    <div className="ExerciseDatabase">
      <div className="exercise_database_container"></div>
      <h2>Exercise Database</h2>

      {loading ? <p>Loading exercises...</p> : null}

      {exercises.length === 0 && !loading ? <p>No exercises found.</p> : null}

      <ul>
        {exercises.map((exercise) => (
          <li key={exercise.id} className="exercise_container">
            <h3>{exercise.name}</h3>
            <p>
              <strong>Cues:</strong> {exercise.cues}
            </p>
            {exercise.videoDemo && (
              <p>
                <strong>Video Demo:</strong>{" "}
                <a
                  href={exercise.videoDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Video
                </a>
              </p>
            )}
            {exercise.otherNotes && (
              <p>
                <strong>Other Notes:</strong> {exercise.otherNotes}
              </p>
            )}

            {/* Edit button */}
            <button
              onClick={() => navigate(`/edit-exercise/${exercise.id}`)}
              id="button"
            >
              Edit
            </button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExerciseDatabase;
