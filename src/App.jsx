import { AuthProvider } from "./utils/auth/AuthProvider";
import AppRouter from "./Router";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
