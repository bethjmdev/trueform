import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./utils/auth/SignUpForm";
import SignInForm from "./utils/auth/SignInForm";
import AuthButtons from "./utils/auth/AuthButtons";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<SignUpForm />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/" element={<AuthButtons />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
