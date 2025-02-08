import { useState, useEffect } from "react";
import { useAuth } from "../../utils/auth/AuthProvider";
import { db } from "../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ClientsProfile = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.uid) return;

    const fetchClientProfile = async () => {
      try {
        console.log(`📡 Fetching profile for client UID: ${user.uid}`);
        const clientRef = doc(db, "Clients", user.uid);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          setClientData(clientSnap.data());
        } else {
          console.error("❌ No client profile found.");
        }
      } catch (error) {
        console.error("❌ Error fetching client profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [user]);

  if (loading) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>Client Profile</h2>
      {clientData ? (
        <div>
          <p>
            <strong>Name:</strong> {clientData.name}
          </p>
          <p>
            <strong>Email:</strong> {clientData.email}
          </p>
        </div>
      ) : (
        <p>❌ Profile not found.</p>
      )}
    </div>
  );
};

export default ClientsProfile;
