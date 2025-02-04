import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function EditExercise() {
  const { exerciseId } = useParams(); // Get exercise ID from URL
  const navigate = useNavigate();

  const [exercise, setExercise] = useState({
    name: "",
    cues: "",
    videoDemo: "",
    otherNotes: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch exercise details
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const docRef = doc(db, "ExerciseDatabase", exerciseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setExercise(docSnap.data());
        } else {
          console.error("Exercise not found");
        }
      } catch (error) {
        console.error("Error fetching exercise:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  // Handle form updates
  const handleChange = (e) => {
    setExercise({ ...exercise, [e.target.name]: e.target.value });
  };

  // Handle update submission
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "ExerciseDatabase", exerciseId);
      await updateDoc(docRef, {
        name: exercise.name,
        cues: exercise.cues,
        videoDemo: exercise.videoDemo,
        otherNotes: exercise.otherNotes,
      });

      navigate("/exercise-database"); // Redirect after update
    } catch (error) {
      console.error("Error updating exercise:", error);
    }
  };

  return (
    <div>
      <h2>Edit Exercise</h2>

      {loading ? <p>Loading exercise...</p> : null}

      {!loading && (
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            name="name"
            placeholder="Exercise Name"
            value={exercise.name}
            onChange={handleChange}
            required
          />
          <br />

          <textarea
            name="cues"
            placeholder="Cues"
            value={exercise.cues}
            onChange={handleChange}
            required
          />
          <br />

          <input
            type="text"
            name="videoDemo"
            placeholder="Video Demo URL"
            value={exercise.videoDemo}
            onChange={handleChange}
          />
          <br />

          <textarea
            name="otherNotes"
            placeholder="Other Notes"
            value={exercise.otherNotes}
            onChange={handleChange}
          />
          <br />

          <button type="submit">Update Exercise</button>
        </form>
      )}
    </div>
  );
}

export default EditExercise;
