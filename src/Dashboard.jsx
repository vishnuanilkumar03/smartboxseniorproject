// src/Dashboard.jsx
import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { ref, onValue, set, push } from "firebase/database";
import { signOut } from "firebase/auth";

function Dashboard({ onLogout, onSettings, onHistory }) {
  const [status, setStatus] = useState("Unknown");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const statusRef = ref(db, "devices/box1/status");
    onValue(statusRef, (snapshot) => setStatus(snapshot.val()));

    const logsRef = ref(db, "logs");
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLogs(Object.values(data).reverse().slice(0, 20)); // Only fetch 20
      }
    });
  }, []);

  const toggleLock = async () => {
    const newStatus = status === "LOCKED" ? "UNLOCKED" : "LOCKED";
    const time = new Date().toLocaleString();

    await set(ref(db, "devices/box1/status"), newStatus);
    push(ref(db, "logs"), { time, action: newStatus });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      
      {/* Settings Button */}
      <button
        onClick={onSettings}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          backgroundColor: "orange",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Settings
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "8px 16px",
          backgroundColor: "gray",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Log Out
      </button>

      <h2>Homeowner Dashboard</h2>
      <p><b>Lock Status:</b> {status}</p>

      {/* Lock / Unlock */}
      <button
        onClick={toggleLock}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          backgroundColor: status === "LOCKED" ? "green" : "red",
          color: "white",
          fontSize: "18px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        {status === "LOCKED" ? "Unlock Box" : "Lock Box"}
      </button>

      {/* Recent Activity Summary */}
      <h3 style={{ marginTop: "40px" }}>Recent Activity</h3>
      {logs.length > 0 ? (
        <div style={{ marginTop: "15px", fontSize: "16px" }}>
          <p><b>Last Action:</b> {logs[0].action}</p>
          <p><b>Time:</b> {logs[0].time}</p>
        </div>
      ) : (
        <p>No recent activity</p>
      )}

      {/* Go To History Page */}
      <button
        onClick={onHistory}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        View Full History
      </button>
    </div>
  );
}

export default Dashboard;
