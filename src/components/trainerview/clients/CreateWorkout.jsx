import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore"; // ✅ Import this

const CreateWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const client_uid = location.state?.client_uid;
  // const trainer_uid = "mMvzoIRDMsgNDYooKgQU49LvBb32"; // Replace with actual logged-in trainer
  const auth = getAuth();

  const currentUser = auth.currentUser;
  const trainer_uid = currentUser ? currentUser.uid : null;

  const [workoutName, setWorkoutName] = useState("");
  const [notes, setNotes] = useState("");
  const [exerciseDatabase, setExerciseDatabase] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedCircuitExercise, setSelectedCircuitExercise] = useState(""); // Dropdown selection

  const [newExercise, setNewExercise] = useState({
    name: "",
    reps: "",
    sets: "",
    weight: "",
    cues: "",
    videoDemo: "",
    circuit_id: null,
    timestamp: "",
    type: "exercise", // ✅ Default tag
  });

  if (!trainer_uid) {
    console.error("❌ Trainer is not logged in.");
    return;
  }

  console.log(trainer_uid);

  // 🔥 Fetch available exercises from ExerciseDatabase
  useEffect(() => {
    const fetchExerciseDatabase = async () => {
      try {
        console.log("📡 Fetching exercises from ExerciseDatabase...");
        const querySnapshot = await getDocs(collection(db, "ExerciseDatabase"));
        const exercisesList = querySnapshot.docs.map((doc) => ({
          name: doc.data().name,
          cues: doc.data().cues,
          type: doc.data().type,
          videoDemo: doc.data().videoDemo, // ✅ Fixed naming
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
      videoDemo: selectedExercise.videoDemo, // ✅ Fixed naming
    });
  };

  // 🔥 Add exercise & maintain circuit linking
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

    // let updatedExercise = { ...newExercise, circuit_id: null };
    let updatedExercise = {
      ...newExercise,
      circuit_id: null,
      type: newExercise.type,
    };

    // if (selectedCircuitExercise) {
    //   // 🔥 Link exercise to selected one in dropdown
    //   const linkedExercise = selectedExercises.find(
    //     (e) => e.name === selectedCircuitExercise
    //   );
    //   if (linkedExercise) {
    //     updatedExercise.circuit_id = linkedExercise.circuit_id || uuidv4();
    //     linkedExercise.circuit_id = updatedExercise.circuit_id; // Ensure previous exercise is also linked
    //   }
    // }

    if (selectedCircuitExercise) {
      const linkedExercise = selectedExercises.find(
        (e) => e.name === selectedCircuitExercise
      );
      if (linkedExercise) {
        updatedExercise.circuit_id = linkedExercise.circuit_id || uuidv4();
        linkedExercise.circuit_id = updatedExercise.circuit_id; // Keep consistency
      }
    }

    // setSelectedExercises([...selectedExercises, updatedExercise]);
    setSelectedExercises((prevExercises) => [
      ...prevExercises,
      updatedExercise,
    ]);

    // ✅ Clear all input fields after adding an exercise
    setNewExercise({
      name: "",
      reps: "",
      sets: "",
      weight: "",
      cues: "",
      type: "",
      videoDemo: "",
      circuit_id: null,
    });

    setSelectedCircuitExercise(""); // Reset dropdown selection
  };

  // 🔥 Remove exercise from list
  const handleRemoveExercise = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
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
      created_at: serverTimestamp(),
      type: "exercise", // ✅ Default tag
    };

    const workoutExercises = selectedExercises.reduce((acc, exercise) => {
      acc[exercise.name] = {
        reps: exercise.reps,
        sets: exercise.sets,
        weight: exercise.weight,
        cues: exercise.cues,
        videoDemo: exercise.videoDemo,
        circuit_id: exercise.circuit_id,
        type: exercise.type,
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
        placeholder="Weight"
        value={newExercise.weight}
        onChange={(e) => handleNewExerciseChange("weight", e.target.value)}
      />
      <select
        value={newExercise.type}
        onChange={(e) => handleNewExerciseChange("type", e.target.value)}
      >
        <option value="exercise">Strength</option>
        <option value="warm up">Warm Up</option>
        <option value="cool down">Cool Down</option>
        <option value="cardio">Cardio</option>
      </select>

      <select
        value={selectedCircuitExercise}
        onChange={(e) => setSelectedCircuitExercise(e.target.value)}
      >
        <option value="">-- Link to Exercise --</option>
        {selectedExercises.map((exercise, index) => (
          <option key={index} value={exercise.name}>
            {exercise.name}
          </option>
        ))}
      </select>

      <button onClick={handleAddExercise}>Add Exercise</button>

      {selectedExercises.length > 0 && (
        <div>
          <h3>Workout Preview</h3>
          {selectedExercises.map((exercise, index) => (
            <div
              key={index}
              style={{
                border: exercise.circuit_id ? "2px solid blue" : "none",
                padding: "5px",
              }}
            >
              <h4>
                {index + 1}. {exercise.name} <span>({exercise.type})</span>
              </h4>

              <p>
                <strong>Reps:</strong> {exercise.reps}
              </p>
              <p>
                <strong>Sets:</strong> {exercise.sets}
              </p>
              <p>
                <strong>Weight:</strong> {exercise.weight} lbs
              </p>
              <p>
                <strong>Cues:</strong> {exercise.cues}
              </p>
              {exercise.circuit_id && <p>🔥 Circuit</p>}
              <button onClick={() => handleRemoveExercise(index)}>
                ❌ Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSaveWorkout}>Save Workout</button>
    </div>
  );
};

export default CreateWorkout;
