import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpFormClient from "./utils/auth/SignUpFormClient";
import SignUpFormTrainer from "./utils/auth/SignUpFormClient";
import SignInForm from "./utils/auth/SignInForm";
import AuthButtons from "./utils/auth/AuthButtons";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/client-reg" element={<SignUpFormClient />} />
        <Route path="/trainer-reg" element={<SignUpFormTrainer />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/" element={<AuthButtons />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
