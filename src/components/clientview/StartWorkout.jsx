import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase/firebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth";

const StartWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workoutDetails = location.state?.workoutDetails;
  const workout_name = location.state?.workout_name;
  const [time, setTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState({});
  const [reps, setReps] = useState({});
  const [notes, setNotes] = useState("");
  const [exerciseProgress, setExerciseProgress] = useState({});
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [questions, setQuestions] = useState({
    slept_6_hours: "",
    motivated: "",
    ate_enough: "",
    hydrated: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (workoutDetails) {
      const initialWeights = {};
      const initialReps = {};
      const initialProgress = {};
      Object.entries(workoutDetails).forEach(([exercise, details]) => {
        initialWeights[exercise] = new Array(Number(details.sets)).fill(
          details.weight || ""
        );
        initialReps[exercise] = new Array(Number(details.sets)).fill(
          details.reps || ""
        );
        initialProgress[exercise] = new Array(Number(details.sets)).fill(false);
      });
      setWeights(initialWeights);
      setReps(initialReps);
      setExerciseProgress(initialProgress);
    }
  }, [workoutDetails]);

  const handleWeightChange = (exercise, setIndex, value) => {
    setWeights((prevWeights) => ({
      ...prevWeights,
      [exercise]: prevWeights[exercise].map((weight, index) =>
        index === setIndex ? value : weight
      ),
    }));
  };

  const handleRepsChange = (exercise, setIndex, value) => {
    setReps((prevReps) => ({
      ...prevReps,
      [exercise]: prevReps[exercise].map((rep, index) =>
        index === setIndex ? value : rep
      ),
    }));
  };

  const handleCheckboxChange = (exercise, setIndex) => {
    setExerciseProgress((prevProgress) => ({
      ...prevProgress,
      [exercise]: prevProgress[exercise].map((checked, index) =>
        index === setIndex ? !checked : checked
      ),
    }));
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleQuestionChange = (question, value) => {
    setQuestions((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const saveWorkout = async () => {
    if (!workoutDetails || !currentUser) return;

    setSaving(true);
    const exerciseDocId = uuidv4();

    try {
      clearInterval(time);

      let totalSets = 0;
      let completedSets = 0;
      Object.values(exerciseProgress).forEach((sets) => {
        totalSets += sets.length;
        completedSets += sets.filter((set) => set).length;
      });

      await setDoc(doc(collection(db, "PastWorkoutDetails"), exerciseDocId), {
        uid: currentUser.uid,
        workout_name,
        timestamp: serverTimestamp(),
        duration_seconds: time,
        notes: notes.trim(),
        completed_sets_count: completedSets,
        total_sets_count: totalSets,
        ...questions,
      });

      const workoutExercises = {};
      Object.entries(workoutDetails).forEach(([exercise, details]) => {
        const checkedIndices = exerciseProgress[exercise]
          ?.map((checked, index) => (checked ? index : null))
          .filter((index) => index !== null);

        workoutExercises[exercise] = {
          ...details,
          actual_weights_per_set: checkedIndices.map(
            (i) => weights[exercise]?.[i] ?? ""
          ),
          actual_reps_per_set: checkedIndices.map(
            (i) => reps[exercise]?.[i] ?? ""
          ),
          completed_sets: checkedIndices.map(() => true),
        };
      });

      await setDoc(
        doc(collection(db, "PastWorkoutExercises"), exerciseDocId),
        workoutExercises
      );

      alert("Workout saved successfully!");
      navigate("/client-homepage");
    } catch (error) {
      console.error("Error saving workout:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!workoutDetails) return <p>Workout data not found.</p>;

  // ✅ Group exercises by `circuit_id`
  const groupedExercises = {};
  const nonCircuitExercises = [];

  Object.entries(workoutDetails).forEach(([exercise, details]) => {
    if (details.circuit_id) {
      if (!groupedExercises[details.circuit_id]) {
        groupedExercises[details.circuit_id] = [];
      }
      groupedExercises[details.circuit_id].push([exercise, details]);
    } else {
      nonCircuitExercises.push([exercise, details]);
    }
  });

  return (
    <div>
      <h2>Workout in Progress</h2>

      {workout_name && <h3>Workout: {workout_name}</h3>}

      <button
        onClick={saveWorkout}
        disabled={saving}
        style={{ marginTop: "10px" }}
      >
        {saving ? "Saving..." : "Save Workout"}
      </button>

      {/* ✅ Render Circuit Groups */}
      {Object.entries(groupedExercises).map(([circuit_id, exercises]) => (
        <div
          key={circuit_id}
          style={{
            border: "2px solid #000",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          <h3>🔥 Circuit </h3>
          {exercises.map(([exercise, details]) => (
            <ExerciseComponent
              key={exercise}
              exercise={exercise}
              details={details}
              handleCheckboxChange={handleCheckboxChange}
              handleRepsChange={handleRepsChange}
              handleWeightChange={handleWeightChange}
              exerciseProgress={exerciseProgress}
              reps={reps}
              weights={weights}
            />
          ))}
        </div>
      ))}

      {/* ✅ Render Non-Circuit Exercises */}
      {nonCircuitExercises.map(([exercise, details]) => (
        <ExerciseComponent
          key={exercise}
          exercise={exercise}
          details={details}
          handleCheckboxChange={handleCheckboxChange}
          handleRepsChange={handleRepsChange}
          handleWeightChange={handleWeightChange}
          exerciseProgress={exerciseProgress}
          reps={reps}
          weights={weights}
        />
      ))}
    </div>
  );
};

// ✅ Extracted Exercise Component to avoid duplication
const ExerciseComponent = ({
  exercise,
  details,
  handleCheckboxChange,
  handleRepsChange,
  handleWeightChange,
  exerciseProgress,
  reps,
  weights,
}) => (
  <div>
    <h3>{exercise}</h3>
    {details.videoDemo && (
      <p>
        <strong>Video Demo:</strong>{" "}
        <a href={details.videoDemo} target="_blank" rel="noopener noreferrer">
          {details.videoDemo}
        </a>
      </p>
    )}

    <p>
      <strong>Reps (Planned):</strong> {details.reps}
    </p>
    <p>
      <strong>Weight (Planned):</strong> {details.weight} lbs
    </p>
    <p>
      <strong>Sets:</strong> {details.sets}
    </p>
    <p>
      <strong>Cues:</strong> {details.cues}
    </p>

    <div>
      <strong>Complete Sets:</strong>
      {exerciseProgress[exercise]?.map((isChecked, setIndex) => (
        <label
          key={setIndex}
          style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleCheckboxChange(exercise, setIndex)}
            style={{ marginRight: "10px" }}
          />
          Set {setIndex + 1}
          <input
            type="number"
            value={reps[exercise]?.[setIndex] ?? ""}
            onChange={(e) =>
              handleRepsChange(exercise, setIndex, e.target.value)
            }
            style={{ marginLeft: "10px", width: "50px" }}
            placeholder="Reps"
          />
          <input
            type="number"
            value={weights[exercise]?.[setIndex] ?? ""}
            onChange={(e) =>
              handleWeightChange(exercise, setIndex, e.target.value)
            }
            style={{ marginLeft: "10px", width: "60px" }}
            placeholder="Weight"
          />
          lbs
        </label>
      ))}
    </div>
  </div>
);

export default StartWorkout;
