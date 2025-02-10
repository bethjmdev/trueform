import { useState, useEffect } from "react";
import { useAuth } from "../../../utils/auth/AuthProvider";
import { db } from "../../../utils/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ViewClients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.uid) return;

    const fetchClients = async () => {
      try {
        console.log(`📡 Fetching clients for trainer UID: ${user.uid}`);

        // 🔥 Query Clients where trainer UID matches logged-in trainer
        const clientsQuery = query(
          collection(db, "Clients"),
          where("trainer", "==", user.uid)
        );

        const querySnapshot = await getDocs(clientsQuery);

        const clientList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("✅ Clients found:", clientList);
        setClients(clientList);
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
      <h2>Your Clients</h2>

      {loading && <p>Loading clients...</p>}

      {!loading && clients.length === 0 && <p>No clients assigned to you.</p>}

      <ul>
        {clients.map((client) => (
          <li key={client.id}>
            <h3
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() =>
                navigate("/client-profile", {
                  state: { client },
                })
              }
            >
              {client.name}
            </h3>
            <p>
              <strong>Email:</strong> {client.email}
            </p>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewClients;
