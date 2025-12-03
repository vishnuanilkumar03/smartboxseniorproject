// src/Dashboard.jsx
import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { ref, onValue, set, push } from "firebase/database";
import { signOut } from "firebase/auth";

function Dashboard({ onLogout, onSettings, onHistory }) {
  const [status, setStatus] = useState("Unknown");
  const [logs, setLogs] = useState([]);

  // Listen to box lock/unlock status
  useEffect(() => {
    const statusRef = ref(db, "devices/box1/status");
    onValue(statusRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setStatus(val);
    });

    const logsRef = ref(db, "logs");
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLogs(Object.values(data).reverse().slice(0, 20));
      }
    });
  }, []);

  // ============= HOMEOWNER NFC REQUESTS ==============
  const requestUnlock = async () => {
    await set(ref(db, "devices/box1/homeowner_signal"), "UNLOCK_REQUEST");
    alert("Tap your phone or NFC card on the SmartBox to UNLOCK.");
  };

  const requestLock = async () => {
    await set(ref(db, "devices/box1/homeowner_signal"), "LOCK_REQUEST");
    alert("Tap your phone or NFC card on the SmartBox to LOCK.");
  };

  // ============= LOGOUT HANDLER =====================
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card-wide">
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <button className="btn btn-secondary" onClick={onSettings}>
          Settings
        </button>

        <button className="btn btn-secondary" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* Header */}
      <h2>Homeowner Dashboard</h2>
      <p className="text-dim">Control and monitor your SmartBox.</p>

      {/* Lock Status & Button */}
      <div
        style={{
          marginTop: "25px",
          padding: "18px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          background: "#151515",
        }}
      >
        <p style={{ marginBottom: "10px" }}>
          <b>Lock Status:</b> {status}
        </p>

        <button
          onClick={status === "LOCKED" ? requestUnlock : requestLock}
          className="btn"
          style={{
            width: "100%",
            marginTop: "10px",
            background: status === "LOCKED" ? "var(--success)" : "var(--danger)",
            boxShadow:
              status === "LOCKED"
                ? "0 0 10px rgba(40,205,65,0.6)"
                : "0 0 10px rgba(255,59,48,0.6)",
          }}
        >
          {status === "LOCKED" ? "Unlock Box" : "Lock Box"}
        </button>
      </div>

      {/* Recent Activity */}
      <h3 style={{ marginTop: "30px" }}>Recent Activity</h3>

      {logs.length > 0 ? (
        <div
          style={{
            marginTop: "10px",
            padding: "14px",
            borderRadius: "10px",
            background: "#151515",
            border: "1px solid var(--border)",
          }}
        >
          <p>
            <b>Last Action:</b> {logs[0].action}
          </p>
          <p className="text-dim">Time: {logs[0].time}</p>
        </div>
      ) : (
        <p className="text-dim">No recent activity.</p>
      )}

      {/* Full History Button */}
      <button
        onClick={onHistory}
        className="btn btn-secondary"
        style={{ marginTop: "24px" }}
      >
        View Full History
      </button>
    </div>
  );
}

export default Dashboard;
