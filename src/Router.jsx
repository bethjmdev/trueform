import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpFormClient from "./utils/auth/SignUpFormClient";
import SignUpFormTrainer from "./utils/auth/SignUpFormTrainer";
import SignInFormClient from "./utils/auth/SignInFormClient";
import SignInFormTrainer from "./utils/auth/SignInFormTrainer";
import AuthButtons from "./utils/auth/AuthButtons";
import TrainerHomePage from "./components/trainerview/TrainerHomePage";
import ClientHomePage from "./components/clientview/ClientHomePage";
import ProtectedRoute from "./utils/auth/ProtectedRoute";
import AddExercise from "./components/trainerview/exercise/AddExercise";
import ExerciseDatabase from "./components/trainerview/exercise/ExerciseDatabase";
import EditExercise from "./components/trainerview/exercise/EditExercise";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/client-reg" element={<SignUpFormClient />} />
        <Route path="/trainer-reg" element={<SignUpFormTrainer />} />
        <Route path="/client-signin" element={<SignInFormClient />} />
        <Route path="/trainer-signin" element={<SignInFormTrainer />} />

        {/* Protected Routes */}
        <Route
          path="/trainer-homepage"
          element={<ProtectedRoute element={<TrainerHomePage />} />}
        />
        <Route
          path="/client-homepage"
          element={<ProtectedRoute element={<ClientHomePage />} />}
        />
        <Route
          path="/exercise-database"
          element={<ProtectedRoute element={<ExerciseDatabase />} />}
        />
        <Route
          path="/add-exercise"
          element={<ProtectedRoute element={<AddExercise />} />}
        />

        <Route
          path="/edit-exercise/:exerciseId"
          element={<ProtectedRoute element={<EditExercise />} />}
        />

        <Route path="/" element={<AuthButtons />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
