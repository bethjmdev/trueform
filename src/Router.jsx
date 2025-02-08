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
import Profile from "./components/trainerview/Profile";
import ViewAllClients from "./components/trainerview/clients/ViewAllClients";
import ViewIndClient from "./components/trainerview/clients/ViewIndClient";
import ViewIndWorkout from "./components/trainerview/clients/ViewIndWorkout";
import EditWorkout from "./components/trainerview/clients/EditWorkout";
import CreateWorkout from "./components/trainerview/clients/CreateWorkout";
import ViewWorkouts from "./components/clientview/ViewWorkouts";
import SingleWorkout from "./components/clientview/SingleWorkout";
import ClientProfile from "./components/clientview/ClientProfile";

// const AppRouter = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/client-reg" element={<SignUpFormClient />} />
//         <Route path="/trainer-reg" element={<SignUpFormTrainer />} />
//         <Route path="/client-signin" element={<SignInFormClient />} />
//         <Route path="/trainer-signin" element={<SignInFormTrainer />} />

//         {/* Protected Routes */}
//         <Route
//           path="/trainer-homepage"
//           element={<ProtectedRoute element={<TrainerHomePage />} />}
//         />
//         <Route
//           path="/client-homepage"
//           element={<ProtectedRoute element={<ClientHomePage />} />}
//         />

//         <Route
//           path="/profile"
//           element={<ProtectedRoute element={<Profile />} />}
//         />

//         {/* 🔥 Trainer-Only Routes */}
//         <Route
//           path="/exercise-database"
//           element={
//             <ProtectedRoute element={<ExerciseDatabase />} trainerOnly />
//           }
//         />
//         <Route
//           path="/add-exercise"
//           element={<ProtectedRoute element={<AddExercise />} trainerOnly />}
//         />
//         <Route
//           path="/edit-exercise/:exerciseId"
//           element={<ProtectedRoute element={<EditExercise />} trainerOnly />}
//         />
//         <Route
//           path="/all-clients"
//           element={<ProtectedRoute element={<ViewAllClients />} trainerOnly />}
//         />

//         <Route
//           path="/client-profile"
//           element={<ProtectedRoute element={<ViewIndClient />} trainerOnly />}
//         />

//         <Route
//           path="/workout-details"
//           element={<ProtectedRoute element={<ViewIndWorkout />} trainerOnly />}
//         />

//         <Route
//           path="/edit-workout"
//           element={<ProtectedRoute element={<EditWorkout />} trainerOnly />}
//         />

//         <Route
//           path="/create-workout"
//           element={<ProtectedRoute element={<CreateWorkout />} trainerOnly />}
//         />

//         <Route path="/" element={<AuthButtons />} />
//       </Routes>
//     </Router>
//   );
// };

// export default AppRouter;

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
          path="/profile"
          element={<ProtectedRoute element={<Profile />} />}
        />

        {/* 🔥 Trainer-Only Routes */}
        <Route
          path="/exercise-database"
          element={
            <ProtectedRoute element={<ExerciseDatabase />} trainerOnly />
          }
        />
        <Route
          path="/add-exercise"
          element={<ProtectedRoute element={<AddExercise />} trainerOnly />}
        />
        <Route
          path="/edit-exercise/:exerciseId"
          element={<ProtectedRoute element={<EditExercise />} trainerOnly />}
        />
        <Route
          path="/all-clients"
          element={<ProtectedRoute element={<ViewAllClients />} trainerOnly />}
        />
        <Route
          path="/client-profile"
          element={<ProtectedRoute element={<ViewIndClient />} trainerOnly />}
        />
        <Route
          path="/workout-details"
          element={<ProtectedRoute element={<ViewIndWorkout />} trainerOnly />}
        />
        <Route
          path="/edit-workout"
          element={<ProtectedRoute element={<EditWorkout />} trainerOnly />}
        />
        <Route
          path="/create-workout"
          element={<ProtectedRoute element={<CreateWorkout />} trainerOnly />}
        />

        {/* 🔥 Client-Only Routes */}
        <Route
          path="/view-workout"
          element={<ProtectedRoute element={<ViewWorkouts />} clientOnly />}
        />

        <Route
          path="/single-workout"
          element={<ProtectedRoute element={<SingleWorkout />} clientOnly />}
        />

        <Route
          path="/client-view-profile"
          element={<ProtectedRoute element={<ClientProfile />} clientOnly />}
        />

        <Route path="/" element={<AuthButtons />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
