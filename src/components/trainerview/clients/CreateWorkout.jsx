import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore"; // ✅ Import this

import "./CreateWorkout.css";

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

  const [exerciseNotFound, setExerciseNotFound] = useState(false);

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
    tempo: "", // ✅ New
    tempoLength: "", // ✅ New
    notes: "", // ✅ New
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

  const handleNewExerciseChange = (field, value) => {
    if (field === "name") {
      const filtered = exerciseDatabase.filter((exercise) =>
        exercise.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredExercises(filtered);

      // Show notification if exercise is not found
      setExerciseNotFound(filtered.length === 0 && value.trim() !== "");
    }

    // setNewExercise({ ...newExercise, [field]: value });
    setNewExercise((prev) => ({ ...prev, [field]: value }));
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

    //NEW
    let nextIndex = selectedExercises.length
      ? Math.max(...selectedExercises.map((e) => e.index || 0)) + 1
      : 1;

    // let updatedExercise = {
    //   ...newExercise,
    //   circuit_id: null,
    //   type: newExercise.type,
    //   index: nextIndex, // Assign the next available index
    // };

    let updatedExercise = {
      ...newExercise,
      circuit_id: null,
      type: newExercise.type,
      index: nextIndex,
      tempo: newExercise.tempo, // ✅ New
      tempoLength: newExercise.tempoLength, // ✅ New
      notes: newExercise.notes, // ✅ New
    };

    //NEW
    if (selectedCircuitExercise) {
      const linkedExercise = selectedExercises.find(
        (e) => e.name === selectedCircuitExercise
      );
      if (linkedExercise) {
        updatedExercise.circuit_id = linkedExercise.circuit_id || uuidv4();
        linkedExercise.circuit_id = updatedExercise.circuit_id; // Keep consistency
        updatedExercise.index = linkedExercise.index; // Assign the same index to circuit exercises
      }
    }

    //NEW
    setSelectedExercises((prevExercises) =>
      [...prevExercises, updatedExercise].sort((a, b) => a.index - b.index)
    );

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
      tempo: "", // ✅ New
      tempoLength: "", // ✅ New
      notes: "", // ✅ New
    });

    setSelectedCircuitExercise(""); // Reset dropdown selection
  };

  // 🔥 Remove exercise from list
  // const handleRemoveExercise = (index) => {
  //   setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  // };

  const handleRemoveExercise = (name, circuitId = null) => {
    if (!name || typeof name !== "string") {
      console.error(
        "❌ Cannot remove exercise because name is missing or invalid:",
        name
      );
      return;
    }

    console.log(
      `🗑️ Attempting to remove exercise: ${name}, circuitId: ${circuitId}`
    );

    setSelectedExercises((prevExercises) => {
      const updatedExercises = prevExercises.filter((exercise) => {
        if (circuitId) {
          return exercise.name !== name || exercise.circuit_id !== circuitId;
        }
        return exercise.name !== name;
      });

      console.log("✅ Updated exercises after removal:", updatedExercises);
      return updatedExercises;
    });
  };

  // 🔥 Save Workout to Firestore
  const handleSaveWorkout = async () => {
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
        index: exercise.index, // Ensure index is saved
        // tempo: exercise.tempo, // ✅ New
        // tempoLength: exercise.tempoLength, // ✅ New
        // notes: exercise.notes, // ✅ New
        tempo: exercise.tempo || "", // ✅ Ensure no undefined values
        tempoLength: exercise.tempoLength || "", // ✅ Ensure no undefined values
        notes: exercise.notes || "",
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

  const sortedExercises = [...selectedExercises].sort(
    (a, b) => a.index - b.index
  );

  // Group circuits while keeping order
  // const circuitGroups = {};
  // const nonCircuitExercises = [];

  // sortedExercises.forEach((exercise) => {
  //   if (exercise.circuit_id) {
  //     if (!circuitGroups[exercise.circuit_id]) {
  //       circuitGroups[exercise.circuit_id] = [];
  //     }
  //     circuitGroups[exercise.circuit_id].push(exercise);
  //   } else {
  //     nonCircuitExercises.push(exercise);
  //   }
  // });

  const circuitGroups = {};
  const nonCircuitExercises = [];

  selectedExercises.forEach((exercise) => {
    if (exercise.circuit_id) {
      if (!circuitGroups[exercise.circuit_id]) {
        circuitGroups[exercise.circuit_id] = [];
      }
      // Ensure exercises exist before adding them
      if (selectedExercises.some((ex) => ex.name === exercise.name)) {
        circuitGroups[exercise.circuit_id].push(exercise);
      }
    } else {
      nonCircuitExercises.push(exercise);
    }
  });

  console.log("🚀 Updated circuit groups after removal:", circuitGroups);

  console.log("🚀 Updated circuit groups:", circuitGroups);

  return (
    <div className="CreateWorkout">
      <div className="create_workout_container">
        <h2>Create Workout</h2>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Workout Name"
          className="input_field"
        />

        <textarea
          placeholder="Add Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input_field"
        />

        <h3>Add Exercise</h3>
        <div className="add_exercise_container">
          <input
            type="text"
            placeholder="Search For Exercise Here"
            value={newExercise.name}
            className="input_field"
            onChange={(e) => handleNewExerciseChange("name", e.target.value)}
          />

          {/* Dropdown is always visible */}
          <select
            className="input_field"
            value={newExercise.name}
            onChange={(e) => {
              const selectedExercise = exerciseDatabase.find(
                (exercise) => exercise.name === e.target.value
              );
              if (selectedExercise) {
                setNewExercise({
                  ...newExercise,
                  name: selectedExercise.name,
                  cues: selectedExercise.cues,
                  videoDemo: selectedExercise.videoDemo,
                });
              }
            }}
          >
            <option value="">Select Exericse Here</option>
            {(filteredExercises.length > 0
              ? filteredExercises
              : exerciseDatabase
            ).map((exercise, index) => (
              <option key={index} value={exercise.name}>
                {exercise.name}
              </option>
            ))}
          </select>

          {exerciseNotFound && (
            <div
              style={{
                position: "fixed",
                // top: "100px",
                top: "55vh",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#ff4d4d",
                color: "white",
                padding: "10px 20px",
                borderRadius: "5px",
                fontSize: "14px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              This exercise isn't in the database. Please add it.
            </div>
          )}
          <textarea
            placeholder="Add Exercise Notes"
            value={newExercise.notes}
            onChange={(e) => handleNewExerciseChange("notes", e.target.value)}
            className="input_field"
          />
          <input
            className="input_field"
            type="text"
            placeholder="Sets"
            value={newExercise.sets}
            onChange={(e) => handleNewExerciseChange("sets", e.target.value)}
          />

          <input
            className="input_field"
            type="text"
            placeholder="Reps"
            value={newExercise.reps}
            onChange={(e) => handleNewExerciseChange("reps", e.target.value)}
          />

          <select
            className="input_field"
            value={newExercise.tempo}
            onChange={(e) => handleNewExerciseChange("tempo", e.target.value)}
          >
            <option value="">Select Tempo</option>
            <option value="none">None</option>
            <option value="eccentric">Eccentric</option>
            <option value="concentric">Concentric</option>
            <option value="isometric">Isometric</option>
          </select>

          <input
            className="input_field"
            type="text"
            placeholder="Tempo Length"
            value={newExercise.tempoLength}
            onChange={(e) =>
              handleNewExerciseChange("tempoLength", e.target.value)
            }
          />

          <input
            className="input_field"
            type="text"
            placeholder="Weight"
            value={newExercise.weight}
            onChange={(e) => handleNewExerciseChange("weight", e.target.value)}
          />
          <select
            className="input_field"
            value={newExercise.type}
            onChange={(e) => handleNewExerciseChange("type", e.target.value)}
          >
            <option value="exercise">Strength</option>
            <option value="warm up">Warm Up</option>
            <option value="cool down">Cool Down</option>
            <option value="cardio">Cardio</option>
          </select>

          <select
            className="input_field"
            value={selectedCircuitExercise}
            onChange={(e) => setSelectedCircuitExercise(e.target.value)}
          >
            <option value="">Make a circuit with...</option>
            {selectedExercises.map((exercise, index) => (
              <option key={index} value={exercise.name}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>
        {/* <button id="button">Add Exercise</button> */}
        <button id="button" onClick={handleAddExercise}>
          Add Exercise
        </button>

        {selectedExercises.length > 0 && (
          <div>
            <h3>Workout Preview</h3>

            {[...Object.values(circuitGroups), ...nonCircuitExercises].map(
              (group, idx) =>
                Array.isArray(group) ? (
                  <div
                    key={idx}
                    style={{
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "3rem",
                      background: "#FDF8F6",
                    }}
                    className="exercise_block"
                  >
                    <h3>🔥 Circuit</h3>
                    {group.map((exercise, index) => (
                      <div key={index} style={{ marginBottom: "10px" }}>
                        <h4>{exercise.name}</h4>
                        <p>
                          <strong>Notes:</strong> {exercise.note}
                        </p>
                        <p>
                          <strong>Sets:</strong> {exercise.sets}
                        </p>
                        <p>
                          <strong>Reps:</strong> {exercise.reps}
                        </p>
                        <p>
                          <strong>Tempo</strong> {exercise.tempo}
                        </p>
                        <p>
                          <strong>Tempo Length</strong> {exercise.tempoLength}
                        </p>
                        <p>
                          <strong>Weight:</strong> {exercise.weight} lbs
                        </p>
                        <p>
                          <strong>Cues:</strong> {exercise.cues}
                        </p>
                        <button
                          onClick={() =>
                            handleRemoveExercise(
                              exercise.name,
                              exercise.circuit_id
                            )
                          }
                        >
                          ❌ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    key={group.index}
                    style={{
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "3rem",
                      background: "#FDF8F6",
                    }}
                    className="exercise_block"
                  >
                    <h4>{group.name}</h4>
                    <p>
                      <strong>Notes:</strong> {group.note}
                    </p>
                    <p>
                      <strong>Sets:</strong> {group.sets}
                    </p>
                    <p>
                      <strong>Reps:</strong> {group.reps}
                    </p>
                    <p>
                      <strong>Tempo</strong> {group.tempo}
                    </p>
                    <p>
                      <strong>Tempo Length</strong> {group.tempoLength}
                    </p>
                    <p>
                      <strong>Weight:</strong> {group.weight} lbs
                    </p>
                    <p>
                      <strong>Cues:</strong> {group.cues}
                    </p>
                    <button
                      onClick={() =>
                        handleRemoveExercise(group.name, group.circuit_id)
                      }
                    >
                      ❌ Remove
                    </button>
                  </div>
                )
            )}
          </div>
        )}

        <button id="button" onClick={handleSaveWorkout}>
          Save Workout
        </button>
      </div>
    </div>
  );
};

export default CreateWorkout;
