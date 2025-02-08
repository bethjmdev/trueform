// import { useState, useEffect } from "react";
// import { useAuth } from "../../../utils/auth/AuthProvider";
// import { db } from "../../../utils/firebase/firebaseConfig";
// import {
//   doc,
//   getDoc,
//   collection,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";

// const ViewAllClients = () => {
//   const { user } = useAuth();
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchClients = async () => {
//       if (!user) {
//         console.log("❌ No authenticated user found");
//         return;
//       }

//       try {
//         console.log(`✅ Authenticated user UID: ${user.uid}`);

//         // 1️⃣ Get trainer's document
//         const trainerRef = doc(db, "Trainers", user.uid);
//         const trainerDoc = await getDoc(trainerRef);

//         if (!trainerDoc.exists()) {
//           console.log("❌ Trainer document not found in Firestore");
//           setLoading(false);
//           return;
//         }

//         const trainerData = trainerDoc.data();
//         console.log("✅ Trainer document found:", trainerData);

//         const clientIds = trainerData.clients || [];

//         if (clientIds.length === 0) {
//           console.log("ℹ️ Trainer has no assigned clients.");
//           setClients([]);
//           setLoading(false);
//           return;
//         }

//         console.log("✅ Client IDs to fetch:", clientIds);

//         // 2️⃣ Fetch clients whose uid matches trainer's clients array
//         const clientsQuery = query(
//           collection(db, "Clients"),
//           where("uid", "in", clientIds)
//         );
//         console.log("📡 Firestore query created:", clientsQuery);

//         const querySnapshot = await getDocs(clientsQuery);
//         console.log(
//           "✅ Firestore query results:",
//           querySnapshot.docs.map((doc) => doc.data())
//         );

//         const clientsList = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setClients(clientsList);
//       } catch (error) {
//         console.error("❌ Error fetching clients:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClients();
//   }, [user]);

//   return (
//     <div>
//       <h2>My Clients</h2>

//       {loading && <p>Loading clients...</p>}

//       {clients.length === 0 && !loading && <p>No clients found.</p>}

//       <ul>
//         {clients.map((client) => (
//           <li key={client.id}>
//             <h3>{client.name}</h3>
//             <p>
//               <strong>Email:</strong> {client.email}
//             </p>
//             <p>
//               <strong>Assigned Trainer:</strong>{" "}
//               {client.trainer || "Not assigned"}
//             </p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ViewAllClients;

import { useState, useEffect } from "react";
import { useAuth } from "../../../utils/auth/AuthProvider";
import { db } from "../../../utils/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ViewAllClients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) {
        console.log("❌ No authenticated user found");
        return;
      }

      try {
        console.log(`✅ Authenticated user UID: ${user.uid}`);

        // Fetch all clients
        const clientsQuery = collection(db, "Clients");
        const querySnapshot = await getDocs(clientsQuery);
        const clientsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClients(clientsList);
      } catch (error) {
        console.error("❌ Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  return (
    <div>
      <h2>My Clients</h2>

      {loading && <p>Loading clients...</p>}

      {clients.length === 0 && !loading && <p>No clients found.</p>}

      <ul>
        {clients.map((client) => (
          <li key={client.id}>
            {/* ✅ Pass client data via navigate() state instead of URL */}
            <h3
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/client-profile", { state: { client } })}
            >
              {client.name}
            </h3>
            <p>
              <strong>Email:</strong> {client.email}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewAllClients;
