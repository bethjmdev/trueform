import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const EditWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exercise_doc_id = location.state?.exercise_doc_id;
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exerciseDatabase, setExerciseDatabase] = useState([]); // 🔥 Store exercise names from Firestore
  const [newExercise, setNewExercise] = useState({
    name: "",
    reps: "",
    sets: "",
    weight: "",
  });
  const [filteredExercises, setFilteredExercises] = useState([]); // 🔥 Store filtered suggestions

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
          `📡 Fetching exercise details for editing: ${exercise_doc_id}`
        );

        const exerciseRef = doc(db, "CurrentWorkoutExercises", exercise_doc_id);
        const exerciseSnap = await getDoc(exerciseRef);

        if (exerciseSnap.exists()) {
          console.log("✅ Exercise details loaded:", exerciseSnap.data());

          const exerciseData = exerciseSnap.data();
          const exerciseArray = Object.entries(exerciseData).map(
            ([name, details]) => ({
              name,
              ...details,
            })
          );

          setExercises(exerciseArray);
        } else {
          console.error("❌ No exercise found.");
        }
      } catch (error) {
        console.error("❌ Error fetching exercise details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [exercise_doc_id]);

  // 🔥 Fetch Exercise Names from Firestore
  useEffect(() => {
    const fetchExerciseDatabase = async () => {
      try {
        console.log("📡 Fetching exercise database...");
        const querySnapshot = await getDocs(collection(db, "ExerciseDatabase"));
        const exercisesList = querySnapshot.docs.map((doc) => doc.data().name);
        setExerciseDatabase(exercisesList);
      } catch (error) {
        console.error("❌ Error fetching exercise database:", error);
      }
    };

    fetchExerciseDatabase();
  }, []);

  const handleUpdate = async () => {
    try {
      const updatedData = {};
      exercises.forEach((exercise) => {
        updatedData[exercise.name] = {
          reps: exercise.reps,
          sets: exercise.sets,
          weight: exercise.weight,
        };
      });

      const exerciseRef = doc(db, "CurrentWorkoutExercises", exercise_doc_id);
      await updateDoc(exerciseRef, updatedData);

      console.log("✅ Workout updated successfully!");
      navigate("/workout-details", { state: { exercise_doc_id } });
    } catch (error) {
      console.error("❌ Error updating workout:", error);
    }
  };

  const handleChange = (index, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[index][field] = value;
    setExercises(updatedExercises);
  };

  // 🔥 Handle typing in new exercise name (Autocomplete)
  const handleNewExerciseChange = (field, value) => {
    if (field === "name") {
      setFilteredExercises(
        exerciseDatabase.filter((exercise) =>
          exercise.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
    setNewExercise({ ...newExercise, [field]: value });
  };

  // 🔥 Handle selecting an exercise from autocomplete
  const handleSelectExercise = (name) => {
    setNewExercise({ ...newExercise, name });
    setFilteredExercises([]); // Hide suggestions after selection
  };

  const handleAddExercise = () => {
    if (
      !newExercise.name ||
      !newExercise.reps ||
      !newExercise.sets ||
      !newExercise.weight
    ) {
      console.error("❌ Please fill in all fields before adding.");
      return;
    }

    if (!exerciseDatabase.includes(newExercise.name)) {
      console.error(
        "❌ Invalid exercise name. Please choose from suggestions."
      );
      return;
    }

    setExercises([...exercises, newExercise]);
    setNewExercise({ name: "", reps: "", sets: "", weight: "" }); // Reset input fields
  };

  if (!exercise_doc_id) return null;

  return (
    <div>
      <h2>Edit Workout</h2>

      {loading && <p>Loading workout details...</p>}

      {!loading && exercises.length === 0 && <p>No exercise details found.</p>}

      {exercises.length > 0 && (
        <form onSubmit={(e) => e.preventDefault()}>
          {exercises.map((exercise, index) => (
            <div key={index}>
              <h3>{exercise.name}</h3>
              <label>Reps:</label>
              <input
                type="number"
                value={exercise.reps}
                onChange={(e) => handleChange(index, "reps", e.target.value)}
              />
              <br />
              <label>Sets:</label>
              <input
                type="number"
                value={exercise.sets}
                onChange={(e) => handleChange(index, "sets", e.target.value)}
              />
              <br />
              <label>Weight (lbs):</label>
              <input
                type="number"
                value={exercise.weight}
                onChange={(e) => handleChange(index, "weight", e.target.value)}
              />
              <br />
              <hr />
            </div>
          ))}
          <button onClick={handleUpdate}>Save Changes</button>
        </form>
      )}

      <h3>Add New Exercise</h3>
      <input
        type="text"
        placeholder="Exercise Name"
        value={newExercise.name}
        onChange={(e) => handleNewExerciseChange("name", e.target.value)}
      />
      {/* 🔥 Autocomplete Suggestions */}
      {filteredExercises.length > 0 && (
        <ul>
          {filteredExercises.map((exercise, index) => (
            <li key={index} onClick={() => handleSelectExercise(exercise)}>
              {exercise}
            </li>
          ))}
        </ul>
      )}
      <input
        type="number"
        placeholder="Reps"
        value={newExercise.reps}
        onChange={(e) => handleNewExerciseChange("reps", e.target.value)}
      />
      <input
        type="number"
        placeholder="Sets"
        value={newExercise.sets}
        onChange={(e) => handleNewExerciseChange("sets", e.target.value)}
      />
      <input
        type="number"
        placeholder="Weight (lbs)"
        value={newExercise.weight}
        onChange={(e) => handleNewExerciseChange("weight", e.target.value)}
      />
      <button onClick={handleAddExercise}>Add Exercise</button>
    </div>
  );
};

export default EditWorkout;
