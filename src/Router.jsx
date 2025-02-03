import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpFormClient from "./utils/auth/SignUpFormClient";
import SignUpFormTrainer from "./utils/auth/SignUpFormTrainer";
import SignInFormClient from "./utils/auth/SignInFormClient";
import SignInFormTrainer from "./utils/auth/SignInFormTrainer";
import AuthButtons from "./utils/auth/AuthButtons";
import TrainerHomePage from "./components/trainerview/TrainerHomePage";
import ClientHomePage from "./components/clientview/ClientHomePage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/client-reg" element={<SignUpFormClient />} />
        <Route path="/trainer-reg" element={<SignUpFormTrainer />} />
        <Route path="/client-signin" element={<SignInFormClient />} />
        <Route path="/trainer-signin" element={<SignInFormTrainer />} />
        <Route path="/trainer-homepage" element={<TrainerHomePage />} />
        <Route path="/client-homepage" element={<ClientHomePage />} />
        <Route path="/" element={<AuthButtons />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
