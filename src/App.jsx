import AuthForm from "./utils/auth/AuthForm";
import AuthButtons from "./utils/auth/AuthButtons";
import { AuthProvider } from "./utils/auth/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <AuthForm />
        <AuthButtons />
      </div>
    </AuthProvider>
  );
}

export default App;
