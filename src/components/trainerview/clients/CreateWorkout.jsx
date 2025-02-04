// function CreateWorkout() {
//   return (
//     <div>
//       <p>hi</p>
//       <p>hi</p>
//     </div>
//   );
// }

// export default CreateWorkout;

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const CreateWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const client_uid = location.state?.client_uid; // Get client ID from navigation state
  const trainer_uid = "mMvzoIRDMsgNDYooKgQU49LvBb32"; // Replace with actual logged-in trainer

  const [workoutName, setWorkoutName] = useState("");
  const [notes, setNotes] = useState("");
  const [exerciseDatabase, setExerciseDatabase] = useState([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    reps: "",
    sets: "",
    weight: "",
    cues: "",
  });
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);

  // 🔥 Fetch available exercises from ExerciseDatabase
  useEffect(() => {
    const fetchExerciseDatabase = async () => {
      try {
        console.log("📡 Fetching exercises from ExerciseDatabase...");
        const querySnapshot = await getDocs(collection(db, "ExerciseDatabase"));
        const exercisesList = querySnapshot.docs.map((doc) => ({
          name: doc.data().name,
          cues: doc.data().cues,
        }));
        setExerciseDatabase(exercisesList);
      } catch (error) {
        console.error("❌ Error fetching exercises:", error);
      }
    };

    fetchExerciseDatabase();
  }, []);

  // 🔥 Handle typing in new exercise name (Autocomplete)
  const handleNewExerciseChange = (field, value) => {
    if (field === "name") {
      setFilteredExercises(
        exerciseDatabase
          .filter((exercise) =>
            exercise.name.toLowerCase().includes(value.toLowerCase())
          )
          .map((exercise) => exercise.name)
      );
    }
    setNewExercise({ ...newExercise, [field]: value });
  };

  // 🔥 Handle selecting an exercise from autocomplete
  const handleSelectExercise = (name) => {
    setFilteredExercises([]); // Hide suggestions after selection
    const selectedExercise = exerciseDatabase.find(
      (exercise) => exercise.name === name
    );
    if (!selectedExercise) return;

    setNewExercise({
      ...newExercise,
      name: selectedExercise.name,
      cues: selectedExercise.cues,
    });
  };

  // 🔥 Add exercise to list
  const handleAddExercise = () => {
    if (
      !newExercise.name ||
      !newExercise.reps ||
      !newExercise.sets ||
      !newExercise.weight
    ) {
      console.error("❌ Please fill in all fields.");
      return;
    }

    if (
      !exerciseDatabase.some((exercise) => exercise.name === newExercise.name)
    ) {
      console.error(
        "❌ Invalid exercise name. Please choose from suggestions."
      );
      return;
    }

    setSelectedExercises([...selectedExercises, newExercise]);
    setNewExercise({ name: "", reps: "", sets: "", weight: "", cues: "" });
  };

  // 🔥 Save Workout to Firestore
  const handleSaveWorkout = async () => {
    if (!workoutName || selectedExercises.length === 0) {
      console.error("❌ Workout name and exercises are required.");
      return;
    }

    const workoutId = uuidv4(); // Unique ID for both documents

    const workoutDetails = {
      workout_name: workoutName,
      client_uid,
      notes,
      exercise_doc_id: workoutId, // Same ID as CurrentWorkoutExercises doc
      trainer_uid,
    };

    const workoutExercises = selectedExercises.reduce((acc, exercise) => {
      acc[exercise.name] = {
        reps: exercise.reps,
        sets: exercise.sets,
        weight: exercise.weight,
        cues: exercise.cues,
      };
      return acc;
    }, {});

    try {
      await setDoc(doc(db, "CurrentWorkoutDetails", workoutId), workoutDetails);
      await setDoc(
        doc(db, "CurrentWorkoutExercises", workoutId),
        workoutExercises
      );

      console.log("✅ Workout saved!");
      navigate("/workout-details", { state: { exercise_doc_id: workoutId } });
    } catch (error) {
      console.error("❌ Error saving workout:", error);
    }
  };

  return (
    <div>
      <h2>Create Workout</h2>
      <label>Workout Name:</label>
      <input
        type="text"
        value={workoutName}
        onChange={(e) => setWorkoutName(e.target.value)}
      />

      <label>Notes:</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

      <h3>Add Exercise</h3>
      <input
        type="text"
        placeholder="Exercise Name"
        value={newExercise.name}
        onChange={(e) => handleNewExerciseChange("name", e.target.value)}
      />
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
        onChange={(e) => handleNewExerciseChange("reps", e.target.value)}
      />
      <input
        type="number"
        placeholder="Sets"
        onChange={(e) => handleNewExerciseChange("sets", e.target.value)}
      />
      <input
        type="number"
        placeholder="Weight"
        onChange={(e) => handleNewExerciseChange("weight", e.target.value)}
      />
      <button onClick={handleAddExercise}>Add Exercise</button>

      <button onClick={handleSaveWorkout}>Save Workout</button>
    </div>
  );
};

export default CreateWorkout;
