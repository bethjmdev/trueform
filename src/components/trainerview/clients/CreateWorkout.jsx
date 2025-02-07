// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { db } from "../../../utils/firebase/firebaseConfig";
// import { doc, setDoc, collection, getDocs } from "firebase/firestore";
// import { v4 as uuidv4 } from "uuid";

// const CreateWorkout = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const client_uid = location.state?.client_uid;
//   const trainer_uid = "mMvzoIRDMsgNDYooKgQU49LvBb32"; // Replace with actual logged-in trainer

//   const [workoutName, setWorkoutName] = useState("");
//   const [notes, setNotes] = useState("");
//   const [exerciseDatabase, setExerciseDatabase] = useState([]);
//   const [filteredExercises, setFilteredExercises] = useState([]);
//   const [selectedExercises, setSelectedExercises] = useState([]);
//   const [selectedCircuitExercise, setSelectedCircuitExercise] = useState(""); // Dropdown selection

//   const [newExercise, setNewExercise] = useState({
//     name: "",
//     reps: "",
//     sets: "",
//     weight: "",
//     cues: "",
//     circuit_id: null,
//   });

//   // 🔥 Fetch available exercises from ExerciseDatabase
//   useEffect(() => {
//     const fetchExerciseDatabase = async () => {
//       try {
//         console.log("📡 Fetching exercises from ExerciseDatabase...");
//         const querySnapshot = await getDocs(collection(db, "ExerciseDatabase"));
//         const exercisesList = querySnapshot.docs.map((doc) => ({
//           name: doc.data().name,
//           cues: doc.data().cues,
//         }));
//         setExerciseDatabase(exercisesList);
//       } catch (error) {
//         console.error("❌ Error fetching exercises:", error);
//       }
//     };

//     fetchExerciseDatabase();
//   }, []);

//   // 🔥 Handle typing in new exercise name (Autocomplete)
//   const handleNewExerciseChange = (field, value) => {
//     if (field === "name") {
//       setFilteredExercises(
//         exerciseDatabase
//           .filter((exercise) =>
//             exercise.name.toLowerCase().includes(value.toLowerCase())
//           )
//           .map((exercise) => exercise.name)
//       );
//     }
//     setNewExercise({ ...newExercise, [field]: value });
//   };

//   // 🔥 Handle selecting an exercise from autocomplete
//   const handleSelectExercise = (name) => {
//     setFilteredExercises([]); // Hide suggestions after selection
//     const selectedExercise = exerciseDatabase.find(
//       (exercise) => exercise.name === name
//     );
//     if (!selectedExercise) return;

//     setNewExercise({
//       ...newExercise,
//       name: selectedExercise.name,
//       cues: selectedExercise.cues,
//     });
//   };

//   // 🔥 Add exercise & maintain circuit linking
//   const handleAddExercise = () => {
//     if (
//       !newExercise.name ||
//       !newExercise.reps ||
//       !newExercise.sets ||
//       !newExercise.weight
//     ) {
//       console.error("❌ Please fill in all fields.");
//       return;
//     }

//     if (
//       !exerciseDatabase.some((exercise) => exercise.name === newExercise.name)
//     ) {
//       console.error(
//         "❌ Invalid exercise name. Please choose from suggestions."
//       );
//       return;
//     }

//     let updatedExercise = { ...newExercise, circuit_id: null };

//     if (selectedCircuitExercise) {
//       // 🔥 Link exercise to selected one in dropdown
//       const linkedExercise = selectedExercises.find(
//         (e) => e.name === selectedCircuitExercise
//       );
//       if (linkedExercise) {
//         updatedExercise.circuit_id = linkedExercise.circuit_id || uuidv4();
//         linkedExercise.circuit_id = updatedExercise.circuit_id; // Ensure previous exercise is also linked
//       }
//     }

//     setSelectedExercises([...selectedExercises, updatedExercise]);

//     // ✅ Clear all input fields after adding an exercise
//     setNewExercise({
//       name: "", // 🔥 Clears exercise name field
//       reps: "",
//       sets: "",
//       weight: "",
//       cues: "",
//       circuit_id: null,
//     });

//     setSelectedCircuitExercise(""); // Reset dropdown selection
//   };

//   // 🔥 Remove exercise from list
//   const handleRemoveExercise = (index) => {
//     setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
//   };

//   // 🔥 Save Workout to Firestore
//   const handleSaveWorkout = async () => {
//     if (!workoutName || selectedExercises.length === 0) {
//       console.error("❌ Workout name and exercises are required.");
//       return;
//     }

//     const workoutId = uuidv4(); // Unique ID for both documents

//     const workoutDetails = {
//       workout_name: workoutName,
//       client_uid,
//       notes,
//       exercise_doc_id: workoutId, // Same ID as CurrentWorkoutExercises doc
//       trainer_uid,
//     };

//     const workoutExercises = selectedExercises.reduce((acc, exercise) => {
//       acc[exercise.name] = {
//         reps: exercise.reps,
//         sets: exercise.sets,
//         weight: exercise.weight,
//         cues: exercise.cues,
//         circuit_id: exercise.circuit_id, // ✅ Saves circuit ID
//       };
//       return acc;
//     }, {});

//     try {
//       await setDoc(doc(db, "CurrentWorkoutDetails", workoutId), workoutDetails);
//       await setDoc(
//         doc(db, "CurrentWorkoutExercises", workoutId),
//         workoutExercises
//       );

//       console.log("✅ Workout saved!");
//       navigate("/workout-details", { state: { exercise_doc_id: workoutId } });
//     } catch (error) {
//       console.error("❌ Error saving workout:", error);
//     }
//   };

//   return (
//     <div>
//       <h2>Create Workout</h2>
//       <label>Workout Name:</label>
//       <input
//         type="text"
//         value={workoutName}
//         onChange={(e) => setWorkoutName(e.target.value)}
//       />

//       <label>Notes:</label>
//       <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

//       <h3>Add Exercise</h3>
//       <input
//         type="text"
//         placeholder="Exercise Name"
//         value={newExercise.name}
//         onChange={(e) => handleNewExerciseChange("name", e.target.value)}
//       />
//       {filteredExercises.length > 0 && (
//         <ul>
//           {filteredExercises.map((exercise, index) => (
//             <li key={index} onClick={() => handleSelectExercise(exercise)}>
//               {exercise}
//             </li>
//           ))}
//         </ul>
//       )}
//       <input
//         type="number"
//         placeholder="Reps"
//         value={newExercise.reps}
//         onChange={(e) => handleNewExerciseChange("reps", e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Sets"
//         value={newExercise.sets}
//         onChange={(e) => handleNewExerciseChange("sets", e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Weight"
//         value={newExercise.weight}
//         onChange={(e) => handleNewExerciseChange("weight", e.target.value)}
//       />

//       {/* 🔥 Dropdown for linking exercise to a circuit */}
//       <select
//         value={selectedCircuitExercise}
//         onChange={(e) => setSelectedCircuitExercise(e.target.value)}
//       >
//         <option value="">-- Link to Exercise --</option>
//         {selectedExercises.map((exercise, index) => (
//           <option key={index} value={exercise.name}>
//             {exercise.name}
//           </option>
//         ))}
//       </select>

//       <button onClick={handleAddExercise}>Add Exercise</button>

//       {/* 🔥 LIVE PREVIEW OF SELECTED EXERCISES */}
//       {selectedExercises.length > 0 && (
//         <div>
//           <h3>Workout Preview</h3>
//           {selectedExercises.map((exercise, index) => (
//             <div
//               key={index}
//               style={{
//                 border: exercise.circuit_id ? "2px solid blue" : "none",
//                 padding: "5px",
//               }}
//             >
//               <h4>{exercise.name}</h4>
//               <p>
//                 <strong>Reps:</strong> {exercise.reps}
//               </p>
//               <p>
//                 <strong>Sets:</strong> {exercise.sets}
//               </p>
//               <p>
//                 <strong>Weight:</strong> {exercise.weight} lbs
//               </p>
//               <p>
//                 <strong>Cues:</strong> {exercise.cues}
//               </p>
//               {exercise.circuit_id && <p>🔥 Circuit</p>}
//               <button onClick={() => handleRemoveExercise(index)}>
//                 ❌ Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       <button onClick={handleSaveWorkout}>Save Workout</button>
//     </div>
//   );
// };

// export default CreateWorkout;

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

  // 🔥 Remove an exercise from the workout (and track it for Firestore update)
  const handleRemoveExercise = (index) => {
    setRemovedExercises([...removedExercises, exercises[index].name]);
    setExercises(exercises.filter((_, i) => i !== index));
  };

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
              <p>
                <strong>Cues:</strong> {exercise.cues}
              </p>
              <p>
                <strong>Circuit ID:</strong> {exercise.circuit_id || "None"}
              </p>
              <button onClick={() => handleRemoveExercise(index)}>
                ❌ Remove
              </button>
              <hr />
            </div>
          ))}
          <button onClick={handleUpdate}>Save Changes</button>
        </form>
      )}
    </div>
  );
};

export default EditWorkout;
