// function Profile() {
//   return (
//     <div>
//       <p>hi</p>
//       <p>hi</p>
//     </div>
//   );
// }

// export default Profile;

import { useState, useEffect } from "react";
import { useAuth } from "../../utils/auth/AuthProvider";
import { db } from "../../utils/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import "../clientview/ClientProfile.css";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Check if user is a Trainer
        const trainerRef = doc(db, "Trainers", user.uid);
        const trainerDoc = await getDoc(trainerRef);

        if (trainerDoc.exists()) {
          setProfile({ ...trainerDoc.data(), role: "Trainer" });
        } else {
          // Otherwise, check if user is a Client
          const clientRef = doc(db, "Clients", user.uid);
          const clientDoc = await getDoc(clientRef);

          if (clientDoc.exists()) {
            setProfile({ ...clientDoc.data(), role: "Client" });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <div className="client-profile-container">
      <h2>Profile</h2>
      <p>
        <strong>Name:</strong> {profile.name}
      </p>
      <p>
        <strong>Email:</strong> {profile.email}
      </p>

      {/* Display Trainer or Client-specific fields */}
      {profile.role === "Trainer" && (
        <div>
          <h3>Trainer Info</h3>
          <p>
            <strong>Clients:</strong>{" "}
            {profile.clients ? profile.clients.length : 0}
          </p>
        </div>
      )}

      {profile.role === "Client" && (
        <div>
          <h3>Client Info</h3>
          <p>
            <strong>Trainer:</strong>{" "}
            {profile.trainer ? profile.trainer : "No trainer assigned"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
