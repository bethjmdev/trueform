import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase/firebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth";

import "../trainerview/clients/ViewIndWorkout.css";

const StartWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workoutDetails = location.state?.workoutDetails;
  const workout_name = location.state?.workout_name;
  const trainer = location.state?.trainer;
  const notesFromTrainer = location.state?.notes;
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

  const [isIdle, setIsIdle] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [questionsCompleted, setQuestionsCompleted] = useState(false);

  useEffect(() => {
    if (!location.state) {
      console.error("⚠ No workout data found! Redirecting...");
      navigate("/client-homepage");
    }
  }, [location, navigate]);

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

  useEffect(() => {
    let idleTimeout;

    // 🛑 Clear any previous timer if a new workout starts
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // ⏱ Start a new workout timer
    const newTimer = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
    setTimerInterval(newTimer); // Store the new interval

    // 🛑 Function to stop the timer due to inactivity
    const stopTimerDueToInactivity = () => {
      clearInterval(newTimer);
      setIsIdle(true);
      console.warn("⏸ Timer stopped due to inactivity!");
    };

    // 🔄 Reset idle timer on user activity
    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(stopTimerDueToInactivity, 20 * 60 * 1000); // 20 minutes
    };

    // 🖱 Listen for user activity
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("touchstart", resetIdleTimer);

    // ⏳ Start the idle timeout countdown
    idleTimeout = setTimeout(stopTimerDueToInactivity, 20 * 60 * 1000);

    return () => {
      clearInterval(newTimer); // Stop the timer when component unmounts or workout changes
      clearTimeout(idleTimeout);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
    };
  }, [workout_name]); // 🔥 Re-run effect when workout_name changes

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
    setQuestions((prev) => {
      const updatedQuestions = { ...prev, [question]: value };

      // ✅ Check if all questions are answered
      const allAnswered = Object.values(updatedQuestions).every(
        (answer) => answer !== ""
      );
      setQuestionsCompleted(allAnswered);

      return updatedQuestions;
    });
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
        trainer,
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

        if (checkedIndices.length > 0) {
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
        }
      });

      // ✅ Save PastWorkoutExercises
      await setDoc(
        doc(collection(db, "PastWorkoutExercises"), exerciseDocId),
        workoutExercises
      );

      await setDoc(
        doc(collection(db, "PastWorkoutExercises"), exerciseDocId),
        workoutExercises,
        trainer
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

  // ✅ Group exercises by circuit_id

  //NEW
  // Step 1️⃣: Identify the first index of each circuit
  const circuitIndexMap = {};

  //NEW
  const exercisesArray = Object.entries(workoutDetails)
    .map(([exercise, details]) => ({
      exercise,
      ...details,
    }))
    .sort((a, b) => {
      const indexA = a.circuit_id ? circuitIndexMap[a.circuit_id] : a.index;
      const indexB = b.circuit_id ? circuitIndexMap[b.circuit_id] : b.index;
      return indexA - indexB;
    });

  // Step 2️⃣: Assign the first index to each circuit group
  exercisesArray.forEach((details) => {
    if (details.circuit_id) {
      if (!circuitIndexMap[details.circuit_id]) {
        circuitIndexMap[details.circuit_id] = details.index; // Store first exercise's index for circuit
      }
    }
  });

  // Step 3️⃣: Sort exercises based on:
  // - First exercise's index for circuits
  // - Individual index for non-circuit exercises
  const sortedExercises = exercisesArray.sort((a, b) => {
    const indexA = a.circuit_id ? circuitIndexMap[a.circuit_id] : a.index;
    const indexB = b.circuit_id ? circuitIndexMap[b.circuit_id] : b.index;
    return indexA - indexB;
  });

  // Step 4️⃣: Group exercises by circuit_id for visual grouping
  const groupedExercises = [];
  const seenCircuits = new Set();

  sortedExercises.forEach((exercise) => {
    if (exercise.circuit_id) {
      // If it's the first time we encounter this circuit_id, create a grouped entry
      if (!seenCircuits.has(exercise.circuit_id)) {
        groupedExercises.push({
          type: "circuit",
          circuit_id: exercise.circuit_id,
          exercises: sortedExercises.filter(
            (e) => e.circuit_id === exercise.circuit_id
          ),
        });
        seenCircuits.add(exercise.circuit_id);
      }
    } else {
      // Non-circuit exercises are added normally
      groupedExercises.push({
        type: "exercise",
        ...exercise,
      });
    }
  });

  console.log("notesFromTrainer", notesFromTrainer);
  return (
    <div className="ViewIndWorkout">
      <div className="view_ind_workout_container">
        {isIdle && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            ⏸ Timer paused due to inactivity.
          </p>
        )}

        {workout_name && <h2>Workout: {workout_name}</h2>}
        {notesFromTrainer && (
          <p>
            <strong>notes from your trainer:</strong> {notesFromTrainer}
          </p>
        )}

        {questionsCompleted && (
          <p>
            <strong>Time Elapsed:</strong>{" "}
            {time >= 3600 ? `${Math.floor(time / 3600)}h ` : ""}
            {time >= 60 ? `${Math.floor((time % 3600) / 60)}m ` : ""}
            {`${time % 60}s`}
          </p>
        )}

        {/* ✅ Pre-Workout Questions (Only Show Until Answered) */}

        {!questionsCompleted && (
          <h3>Fill out these questions, then your workout will show</h3>
        )}

        {!questionsCompleted && (
          <div>
            {[
              {
                key: "slept_6_hours",
                question: "Did you sleep more than 6 hours last night?",
              },
              {
                key: "motivated",
                question: "Do you feel motivated to workout right now?",
              },
              {
                key: "ate_enough",
                question: "Have you had enough to eat/drink today?",
              },
              { key: "hydrated", question: "Have you had enough water today?" },
            ].map(({ key, question }) => (
              <div key={key}>
                <p>
                  <strong>{question}</strong>
                </p>
                <button
                  onClick={() => handleQuestionChange(key, "Yes")}
                  style={{
                    backgroundColor:
                      questions[key] === "Yes" ? "#4CAF50" : "#ddd",
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleQuestionChange(key, "No")}
                  style={{
                    backgroundColor:
                      questions[key] === "No" ? "#FF5252" : "#ddd",
                  }}
                >
                  No
                </button>
              </div>
            ))}
          </div>
        )}

        {questionsCompleted &&
          groupedExercises.map((group) => {
            if (group.type === "circuit") {
              return (
                <div
                  key={group.circuit_id}
                  style={{
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "3rem",
                    background: "#FDF8F6",
                  }}
                  className="exercise_block"
                  id="start_workout"
                >
                  <h3>🔥 Circuit</h3>
                  {group.exercises.map((details) => (
                    <div
                      key={details.exercise}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <h3>{details.exercise}</h3>

                      <a
                        href={details.videoDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.9em",
                          color: "#007bff",
                          marginLeft: "10px",
                          textDecoration: "underline",
                        }}
                      >
                        Click to Watch Demo
                      </a>

                      <p style={{ margin: "0" }}>Planned...</p>
                      <p style={{ margin: "0" }}>
                        <strong>Reps:</strong> {details.reps}{" "}
                        <strong>Weight:</strong> {details.weight} lbs
                      </p>

                      <p style={{ margin: "0" }}>
                        <strong>Tempo :</strong>{" "}
                        {group.tempo ? group.tempo : "No Tempo"}{" "}
                        <strong>Tempo Length:</strong>
                        {group.tempoLength ? group.tempoLength : "No Tempo"}
                      </p>

                      {/* ✅ Checkbox, Reps, and Weights for tracking progress */}
                      {exerciseProgress[details.exercise]?.map(
                        (isChecked, setIndex) => (
                          <label
                            key={setIndex}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "5px",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                handleCheckboxChange(details.exercise, setIndex)
                              }
                            />
                            <input
                              type="number"
                              disabled={!isChecked}
                              value={reps[details.exercise]?.[setIndex] ?? ""}
                              onChange={(e) =>
                                handleRepsChange(
                                  details.exercise,
                                  setIndex,
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="number"
                              disabled={!isChecked}
                              value={
                                weights[details.exercise]?.[setIndex] ?? ""
                              }
                              onChange={(e) =>
                                handleWeightChange(
                                  details.exercise,
                                  setIndex,
                                  e.target.value
                                )
                              }
                            />
                          </label>
                        )
                      )}
                      {/* Add horizontal line after each exercise except the last one */}
                      {details !==
                        group.exercises[group.exercises.length - 1] && (
                        <hr
                          style={{
                            width: "100%",
                            color: "black",
                            margin: "20px 0",
                            border: "none",
                            borderTop: "1px solid black",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              );
            } else {
              return (
                <div
                  key={group.exercise}
                  style={{
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "3rem",
                    background: "#FDF8F6",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="exercise_block"
                >
                  <h3>{group.exercise}</h3>

                  <p style={{ margin: "0" }}>Planned...</p>
                  <p style={{ margin: "0" }}>
                    <strong>Reps:</strong> {group.reps} <strong>Weight:</strong>{" "}
                    {group.weight} lbs
                  </p>
                  <p style={{ margin: "0" }}>
                    <strong>Tempo :</strong>{" "}
                    {group.tempo ? group.tempo : "No Tempo"}{" "}
                    <strong>Tempo Length:</strong>
                    {group.tempoLength ? group.tempoLength : "No Tempo"}
                  </p>

                  {/* ✅ Checkbox, Reps, and Weights for tracking progress */}
                  {exerciseProgress[group.exercise]?.map(
                    (isChecked, setIndex) => (
                      <label
                        key={setIndex}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleCheckboxChange(group.exercise, setIndex)
                          }
                        />
                        <input
                          type="number"
                          disabled={!isChecked}
                          value={reps[group.exercise]?.[setIndex] ?? ""}
                          onChange={(e) =>
                            handleRepsChange(
                              group.exercise,
                              setIndex,
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="number"
                          disabled={!isChecked}
                          value={weights[group.exercise]?.[setIndex] ?? ""}
                          onChange={(e) =>
                            handleWeightChange(
                              group.exercise,
                              setIndex,
                              e.target.value
                            )
                          }
                        />
                      </label>
                    )
                  )}
                </div>
              );
            }
          })}

        {questionsCompleted && (
          <button onClick={saveWorkout} disabled={saving} id="button">
            {saving ? "Saving..." : "End Workout"}
          </button>
        )}
      </div>
    </div>
  );
};

export default StartWorkout;
