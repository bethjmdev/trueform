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
//   const [newExercise, setNewExercise] = useState({
//     name: "",
//     reps: "",
//     sets: "",
//     weight: "",
//     cues: "",
//   });
//   const [filteredExercises, setFilteredExercises] = useState([]);
//   const [selectedExercises, setSelectedExercises] = useState([]); // 👈 Stores added exercises

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

//   // 🔥 Add exercise to list (Updates UI)
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

//     setSelectedExercises([...selectedExercises, newExercise]); // ✅ Add exercise to UI
//     setNewExercise({ name: "", reps: "", sets: "", weight: "", cues: "" }); // ✅ Clear input fields
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
//         onChange={(e) => handleNewExerciseChange("reps", e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Sets"
//         onChange={(e) => handleNewExerciseChange("sets", e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Weight"
//         onChange={(e) => handleNewExerciseChange("weight", e.target.value)}
//       />
//       <button onClick={handleAddExercise}>Add Exercise</button>

//       {/* 🔥 LIVE PREVIEW OF SELECTED EXERCISES */}
//       {selectedExercises.length > 0 && (
//         <div>
//           <h3>Workout Preview</h3>
//           <ul>
//             {selectedExercises.map((exercise, index) => (
//               <li key={index}>
//                 <h4>{exercise.name}</h4>
//                 <p>
//                   <strong>Reps:</strong> {exercise.reps}
//                 </p>
//                 <p>
//                   <strong>Sets:</strong> {exercise.sets}
//                 </p>
//                 <p>
//                   <strong>Weight:</strong> {exercise.weight} lbs
//                 </p>
//                 <p>
//                   <strong>Cues:</strong> {exercise.cues}
//                 </p>
//                 <button onClick={() => handleRemoveExercise(index)}>
//                   ❌ Remove
//                 </button>
//                 <hr />
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <button onClick={handleSaveWorkout}>Save Workout</button>
//     </div>
//   );
// };

// export default CreateWorkout;
//
//
//
//
//

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../utils/firebase/firebaseConfig";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const CreateWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const client_uid = location.state?.client_uid;
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
    circuit_id: null, // Default to null (not in a circuit)
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
  // const handleAddExercise = (linkToAbove) => {
  //   if (
  //     !newExercise.name ||
  //     !newExercise.reps ||
  //     !newExercise.sets ||
  //     !newExercise.weight
  //   ) {
  //     console.error("❌ Please fill in all fields.");
  //     return;
  //   }

  //   if (
  //     !exerciseDatabase.some((exercise) => exercise.name === newExercise.name)
  //   ) {
  //     console.error(
  //       "❌ Invalid exercise name. Please choose from suggestions."
  //     );
  //     return;
  //   }

  //   let updatedExercise = { ...newExercise, circuit_id: null };

  //   // 🔗 If linking to above, assign circuit_id from the last exercise
  //   if (linkToAbove && selectedExercises.length > 0) {
  //     const lastExercise = selectedExercises[selectedExercises.length - 1];
  //     updatedExercise.circuit_id = lastExercise.circuit_id || uuidv4();
  //   }

  //   setSelectedExercises([...selectedExercises, updatedExercise]);
  //   setNewExercise({
  //     name: "",
  //     reps: "",
  //     sets: "",
  //     weight: "",
  //     cues: "",
  //     circuit_id: null,
  //   });
  // };

  const handleAddExercise = (linkToAbove) => {
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

    if (linkToAbove && selectedExercises.length > 0) {
      const lastExercise = selectedExercises[selectedExercises.length - 1];

      // If last exercise has no circuit_id, generate one and assign to both
      if (!lastExercise.circuit_id) {
        const newCircuitId = uuidv4();
        lastExercise.circuit_id = newCircuitId;
        updatedExercise.circuit_id = newCircuitId;
      } else {
        // Otherwise, inherit the circuit_id from the last exercise
        updatedExercise.circuit_id = lastExercise.circuit_id;
      }
    }

    setSelectedExercises([...selectedExercises, updatedExercise]);
    setNewExercise({
      name: "",
      reps: "",
      sets: "",
      weight: "",
      cues: "",
      circuit_id: null,
    });
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
    };

    const workoutExercises = selectedExercises.reduce((acc, exercise) => {
      acc[exercise.name] = {
        reps: exercise.reps,
        sets: exercise.sets,
        weight: exercise.weight,
        cues: exercise.cues,
        circuit_id: exercise.circuit_id, // ✅ Saves circuit ID
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
      <button onClick={() => handleAddExercise(false)}>Add Exercise</button>
      <button onClick={() => handleAddExercise(true)}>Link to Above</button>

      {/* 🔥 LIVE PREVIEW OF SELECTED EXERCISES */}
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
              <h4>{exercise.name}</h4>
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
