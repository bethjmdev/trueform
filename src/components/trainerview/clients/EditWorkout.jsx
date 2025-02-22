import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteField,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

import "./CreateWorkout.css";

const EditWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exercise_doc_id = location.state?.exercise_doc_id;
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exerciseDatabase, setExerciseDatabase] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedCircuitExercise, setSelectedCircuitExercise] = useState(""); // Dropdown selection

  const [newExercise, setNewExercise] = useState({
    name: "",
    reps: "",
    sets: "",
    weight: "",
    cues: "",
    circuit_id: null,
    tempo: "", // ✅ Add tempo
    tempoLength: "", // ✅ Add tempoLength
    notes: "", // ✅ Add notes
  });

  const [removedExercises, setRemovedExercises] = useState([]); // ✅ Track removed exercises

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
          // const exerciseArray = Object.entries(exerciseData).map(
          //   ([name, details]) => ({
          //     name,
          //     ...details,
          //   })
          // );

          const exerciseArray = Object.entries(exerciseData).map(
            ([name, details]) => ({
              name,
              reps: details.reps || "",
              sets: details.sets || "",
              weight: details.weight || "",
              cues: details.cues || "",
              circuit_id: details.circuit_id || null,
              tempo: details.tempo || "", // ✅ Add tempo field
              tempoLength: details.tempoLength || "", // ✅ Add tempoLength field
              notes: details.notes || "", // ✅ Add notes field
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

  // 🔥 Fetch Exercise Names & Cues from Firestore
  useEffect(() => {
    const fetchExerciseDatabase = async () => {
      try {
        console.log("📡 Fetching exercise database...");
        const querySnapshot = await getDocs(collection(db, "ExerciseDatabase"));
        const exercisesList = querySnapshot.docs.map((doc) => ({
          name: doc.data().name,
          cues: doc.data().cues,
        }));
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
          cues: exercise.cues || "",
          circuit_id: exercise.circuit_id || null,
          tempo: exercise.tempo || "", // ✅ Save tempo
          tempoLength: exercise.tempoLength || "", // ✅ Save tempoLength
          notes: exercise.notes || "", // ✅ Save notes
        };
      });

      // 🔥 Remove deleted exercises from Firestore
      removedExercises.forEach((exerciseName) => {
        updatedData[exerciseName] = deleteField();
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

  // // 🔥 Handle typing in new exercise name (Autocomplete)
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

  const handleRemoveExercise = (name, circuitId = null) => {
    if (!name) {
      console.error("❌ Cannot remove exercise because name is undefined.");
      return;
    }

    console.log(
      `🗑️ Attempting to remove exercise: ${name}, circuitId: ${circuitId}`
    );

    if (!exercises || exercises.length === 0) {
      console.error("⚠️ No exercises to remove.");
      return;
    }

    // If the exercise is inside a circuit, only remove it from that circuit
    setExercises((prevExercises) =>
      prevExercises.filter(
        (exercise) =>
          exercise.name !== name ||
          (circuitId !== null && exercise.circuit_id !== circuitId)
      )
    );

    setRemovedExercises((prev) => [...prev, name]);
    console.log(`✅ Removed exercise: ${name} (circuitId: ${circuitId})`);
  };

  // 🔥 Handle selecting an exercise from autocomplete
  const handleSelectExercise = async (name) => {
    setFilteredExercises([]); // Hide suggestions after selection

    const selectedExercise = exerciseDatabase.find(
      (exercise) => exercise.name === name
    );
    if (!selectedExercise) {
      console.error("❌ Selected exercise not found in database.");
      return;
    }

    setNewExercise({
      ...newExercise,
      name: selectedExercise.name,
      cues: selectedExercise.cues,
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

    let updatedExercise = { ...newExercise, circuit_id: null };

    if (selectedCircuitExercise) {
      // 🔥 Link exercise to selected one in dropdown
      const linkedExercise = exercises.find(
        (e) => e.name === selectedCircuitExercise
      );
      if (linkedExercise) {
        updatedExercise.circuit_id = linkedExercise.circuit_id || uuidv4();
        linkedExercise.circuit_id = updatedExercise.circuit_id; // Ensure previous exercise is also linked
      }
    }

    setExercises([...exercises, updatedExercise]);
    setNewExercise({
      name: "",
      reps: "",
      sets: "",
      weight: "",
      cues: "",
      circuit_id: null,
    });
    setSelectedCircuitExercise(""); // Reset dropdown selection
  };

  // ✅ ADD: Sorting exercises before rendering
  const sortedExercises = [...exercises].sort((a, b) => a.index - b.index);

  const circuitGroups = {};
  const nonCircuitExercises = [];

  sortedExercises.forEach((exercise) => {
    if (exercise.circuit_id) {
      if (!circuitGroups[exercise.circuit_id]) {
        circuitGroups[exercise.circuit_id] = [];
      }
      // Only push if it still exists in exercises
      if (exercises.some((ex) => ex.name === exercise.name)) {
        circuitGroups[exercise.circuit_id].push(exercise);
      }
    } else {
      nonCircuitExercises.push(exercise);
    }
  });

  if (!exercise_doc_id) return null;

  return (
    <div className="CreateWorkout">
      <div className="create_workout_container">
        <h2>Edit Workout</h2>

        {loading && <p>Loading workout details...</p>}

        {!loading && exercises.length === 0 && (
          <p>No exercise details found.</p>
        )}
        <br />
        {exercises.length > 0 && (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="add_exercise_container">
              <h3>Add New Exercise</h3>
              <input
                type="text"
                placeholder="Exercise Name"
                className="input_field"
                value={newExercise.name}
                onChange={(e) =>
                  handleNewExerciseChange("name", e.target.value)
                }
              />
              <textarea
                placeholder="Notes"
                className="input_field"
                value={newExercise.notes}
                onChange={(e) =>
                  handleNewExerciseChange("notes", e.target.value)
                }
              />
              {filteredExercises.length > 0 && (
                <ul>
                  {filteredExercises.map((exercise, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      {exercise}
                    </li>
                  ))}
                </ul>
              )}

              <input
                type="text"
                placeholder="Sets"
                className="input_field"
                onChange={(e) =>
                  handleNewExerciseChange("sets", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Reps"
                className="input_field"
                onChange={(e) =>
                  handleNewExerciseChange("reps", e.target.value)
                }
              />
              <select
                className="input_field"
                value={newExercise.tempo}
                onChange={(e) =>
                  handleNewExerciseChange("tempo", e.target.value)
                }
              >
                <option value="">Choose Tempo</option>
                <option value="none">None</option>
                <option value="eccentric">Eccentric</option>
                <option value="concentric">Concentric</option>
                <option value="isometric">Isometric</option>
              </select>

              <input
                type="text"
                placeholder="Tempo Length"
                className="input_field"
                value={newExercise.tempoLength}
                onChange={(e) =>
                  handleNewExerciseChange("tempoLength", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Weight (lbs)"
                className="input_field"
                onChange={(e) =>
                  handleNewExerciseChange("weight", e.target.value)
                }
              />

              <select
                className="input_field"
                value={selectedCircuitExercise}
                onChange={(e) => setSelectedCircuitExercise(e.target.value)}
              >
                <option value="">-- Link to Exercise --</option>
                {exercises.map((exercise, index) => (
                  <option key={index} value={exercise.name}>
                    {exercise.name}
                  </option>
                ))}
              </select>

              <button onClick={handleAddExercise} id="button">
                Add Exercise
              </button>
            </div>
            {[...Object.values(circuitGroups), ...nonCircuitExercises].map(
              (group, idx) =>
                Array.isArray(group) ? (
                  <div
                    key={idx}
                    className="exercise_block"
                    style={{
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "3rem",
                      background: "#FDF8F6",
                    }}
                  >
                    <h3>🔥 Circuit</h3>
                    {group.map((exercise, index) => (
                      <div key={index} style={{ marginBottom: "10px" }}>
                        <h4>{exercise.name}</h4>
                        <p>
                          <strong>Sets:</strong> {exercise.sets}
                        </p>
                        <p>
                          <strong>Reps:</strong> {exercise.reps}
                        </p>
                        <p>
                          <strong>Tempo:</strong> {exercise.tempo}
                        </p>
                        <p>
                          <strong>Tempo Length:</strong> {exercise.tempoLength}
                        </p>
                        <p>
                          <strong>Weight:</strong> {exercise.weight} lbs
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
                    className="exercise_block"
                    style={{
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "3rem",
                      background: "#FDF8F6",
                    }}
                  >
                    <h4>{group.name}</h4>
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
                    {/* <button onClick={() => handleRemoveExercise(group.index)}>
                      ❌ Remove
                    </button> */}
                    <button
                      onClick={() => {
                        console.log("Clicked remove button for:", group);
                        handleRemoveExercise(group?.name);
                      }}
                    >
                      ❌ Remove
                    </button>
                  </div>
                )
            )}
            <button onClick={handleUpdate} id="button">
              Save Changes
            </button>
          </form>
        )}
        <br />
        <br />
      </div>
    </div>
  );
};

export default EditWorkout;
