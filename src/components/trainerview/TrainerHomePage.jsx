// import { auth } from "../../utils/firebase/firebaseConfig";
// import { signOut } from "firebase/auth";
// import { useAuth } from "../../utils/auth/AuthProvider";

// const TrainerHomePage = () => {
//   const user = useAuth();

//   return (
//     <div>
//       <p>hi trainer</p>
//       <button>add exercise</button>
//       <br />
//       <br />
//       <button>view exercise database</button>
//       <br />
//       <br />
//       <button onClick={() => signOut(auth)}>Sign Out</button>
//     </div>
//   );
// };

// export default TrainerHomePage;

import { auth } from "../../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../../utils/auth/AuthProvider";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const TrainerHomePage = () => {
  const user = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div>
      <p>hi trainer</p>

      {/* Navigate to /add-exercise */}
      <button onClick={() => navigate("/add-exercise")}>Add Exercise</button>
      <br />
      <br />

      {/* Navigate to /exercise-database */}
      <button onClick={() => navigate("/exercise-database")}>
        View Exercise Database
      </button>
      <br />
      <br />

      {/* Sign out */}
      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  );
};

export default TrainerHomePage;
