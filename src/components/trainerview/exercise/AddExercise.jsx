// function AddExercise() {
//   return (
//     <>
//       <p>hi</p> <br />
//       <p>add exercise</p>
//     </>
//   );
// }

// export default AddExercise;

import { useState } from "react";
import { db } from "../../../utils/firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

import "./AddExercise.css";

function AddExercise() {
  const [name, setName] = useState("");
  const [cues, setCues] = useState("");
  const [videoDemo, setVideoDemo] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "ExerciseDatabase"), {
        name,
        cues,
        videoDemo,
        otherNotes,
      });

      // Clear form fields after successful submission
      setName("");
      setCues("");
      setVideoDemo("");
      setOtherNotes("");
      setMessage("Exercise added successfully!");
    } catch (error) {
      console.error("Error adding exercise:", error);
      setMessage("Error adding exercise.");
    }
  };

  return (
    <div className="AddExercise">
      <div className="add_exercise_container">
        <h2>Add Exercise</h2>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Exercise Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input_field"
          />
          <br />

          <textarea
            placeholder="Cues"
            value={cues}
            onChange={(e) => setCues(e.target.value)}
            required
            className="input_field"
          />
          <br />

          <input
            type="text"
            placeholder="Video Demo URL"
            value={videoDemo}
            onChange={(e) => setVideoDemo(e.target.value)}
            className="input_field"
          />
          <br />

          <textarea
            placeholder="Other Notes"
            value={otherNotes}
            onChange={(e) => setOtherNotes(e.target.value)}
            className="input_field"
          />
          <br />

          <button type="submit" id="button">
            Add Exercise
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExercise;
