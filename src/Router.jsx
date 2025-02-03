import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpFormClient from "./utils/auth/SignUpFormClient";
import SignUpFormTrainer from "./utils/auth/SignUpFormTrainer";
import SignInFormClient from "./utils/auth/SignInFormClient";
import SignInFormTrainer from "./utils/auth/SignInFormTrainer";
import AuthButtons from "./utils/auth/AuthButtons";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/client-reg" element={<SignUpFormClient />} />
        <Route path="/trainer-reg" element={<SignUpFormTrainer />} />
        <Route path="/trainer-signin" element={<SignInFormClient />} />
        <Route path="/client-signin" element={<SignInFormTrainer />} />
        <Route path="/" element={<AuthButtons />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
