// src/HomeownerHistory.jsx
import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

function HomeownerHistory({ onBack }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const logsRef = ref(db, "logs");
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLogs(Object.values(data).reverse().slice(0, 100));
      }
    });
  }, []);

  return (
    <div className="card-wide">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <button className="btn btn-secondary" onClick={onBack}>
          ⬅ Back
        </button>
      </div>

      <h2>Delivery & Lock History</h2>
      <p className="text-dim">
        The most recent 100 events are shown below.
      </p>

      <div
        style={{
          marginTop: "18px",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              background: "#151515",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <b>{log.action}</b>
            <br />
            <span className="text-dim">{log.time}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-dim">No history available yet.</p>
        )}
      </div>
    </div>
  );
}

export default HomeownerHistory;
