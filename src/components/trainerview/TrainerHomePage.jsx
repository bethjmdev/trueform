// import { auth } from "../../utils/firebase/firebaseConfig";
// import { signOut } from "firebase/auth";
// import { useAuth } from "../../utils/auth/AuthProvider";
// import { useNavigate } from "react-router-dom";

// const TrainerHomePage = () => {
//   const user = useAuth();
//   const navigate = useNavigate();

//   return (
//     <div>
//       <p>hi trainer</p>

//       <button onClick={() => navigate("/add-exercise")}>Add Exercise</button>
//       <br />
//       <br />

//       <button onClick={() => navigate("/exercise-database")}>
//         View Exercise Database
//       </button>
//       <br />
//       <br />

//       <button onClick={() => navigate("/all-clients")}>View Clients</button>
//       <br />
//       <br />

//       {/* ✅ Navigate to Profile */}
//       <button onClick={() => navigate("/profile")}>View Profile</button>
//       <br />
//       <br />

//       <button onClick={() => signOut(auth)}>Sign Out</button>
//       <br />
//       <br />

//       <button>Delete Account</button>
//     </div>
//   );
// };

// export default TrainerHomePage;

import { auth } from "../../utils/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../../utils/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const TrainerHomePage = () => {
  const user = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <p>hi trainer</p>

      <button onClick={() => navigate("/add-exercise")}>Add Exercise</button>
      <br />
      <br />

      <button onClick={() => navigate("/exercise-database")}>
        View Exercise Database
      </button>
      <br />
      <br />

      {/* ✅ Navigate to ViewAllClients */}
      <button onClick={() => navigate("/all-clients")}>View Clients</button>
      <br />
      <br />

      <button onClick={() => navigate("/profile")}>View Profile</button>
      <br />
      <br />

      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  );
};

export default TrainerHomePage;
