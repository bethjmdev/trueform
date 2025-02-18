import { useState, useEffect } from "react";
import { useAuth } from "../../utils/auth/AuthProvider";
import { db } from "../../utils/firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import "./ClientProfile.css";

const ClientProfile = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState([]); // Store trainers list
  const [selectedTrainer, setSelectedTrainer] = useState(""); // Store selected trainer UID
  const [selectedTrainerName, setSelectedTrainerName] = useState(""); // Store selected trainer name
  const [updating, setUpdating] = useState(false); // Handle state for updates

  useEffect(() => {
    if (!user || !user.uid) return;

    const fetchClientProfile = async () => {
      try {
        console.log(`📡 Fetching profile for client UID: ${user.uid}`);
        const clientRef = doc(db, "Clients", user.uid);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const data = clientSnap.data();
          setClientData(data);
          setSelectedTrainer(data.trainer || ""); // Set initial selected trainer
          setSelectedTrainerName(data.trainer_name || "");
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

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        console.log("📡 Fetching trainers...");
        const trainersCollection = collection(db, "Trainers");
        const trainersSnapshot = await getDocs(trainersCollection);
        const trainersList = trainersSnapshot.docs.map((doc) => ({
          uid: doc.id,
          name: doc.data().name,
        }));
        setTrainers(trainersList);
      } catch (error) {
        console.error("❌ Error fetching trainers:", error);
      }
    };

    fetchTrainers();
  }, []);

  const handleTrainerSelection = (trainerUid) => {
    setSelectedTrainer(trainerUid);
    const trainer = trainers.find((t) => t.uid === trainerUid);
    setSelectedTrainerName(trainer ? trainer.name : "");
  };

  const handleUpdateTrainer = async () => {
    if (!selectedTrainer || selectedTrainer === clientData.trainer) {
      alert("Please select a different trainer.");
      return;
    }

    setUpdating(true);
    try {
      const clientRef = doc(db, "Clients", user.uid);
      await updateDoc(clientRef, {
        trainer: selectedTrainer,
        trainer_name: selectedTrainerName,
      });

      // 🔥 Fetch the updated client data from Firestore to confirm update
      const updatedSnap = await getDoc(clientRef);
      if (updatedSnap.exists()) {
        const updatedData = updatedSnap.data();
        console.log("✅ Firestore Updated:", updatedData);

        setClientData(updatedData);
        alert(`Trainer updated to ${updatedData.trainer_name}!`);
      } else {
        console.error("❌ Update failed, no data returned.");
      }
    } catch (error) {
      console.error("❌ Error updating trainer:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="client-profile-container">
      <h2>Profile</h2>
      {clientData ? (
        <div>
          <p>
            <strong>Name:</strong> {clientData.name}
          </p>
          <p>
            <strong>Email:</strong> {clientData.email}
          </p>
          <p>
            <strong>Trainer Name:</strong>{" "}
            {clientData.trainer_name || "Not Assigned"}
          </p>

          {/* 🔥 Trainer Selection Dropdown */}
          <h3>Change Trainer</h3>
          <select
            value={selectedTrainer}
            onChange={(e) => handleTrainerSelection(e.target.value)}
          >
            <option value="">Select a Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.uid} value={trainer.uid}>
                {trainer.name}
              </option>
            ))}
          </select>

          <button onClick={handleUpdateTrainer} disabled={updating}>
            {updating ? "Updating..." : "Update Trainer"}
          </button>
        </div>
      ) : (
        <p>❌ Profile not found.</p>
      )}
    </div>
  );
};

export default ClientProfile;
