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
    <div style={{ textAlign: "center", marginTop: "40px" }}>

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          backgroundColor: "gray",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        ⬅ Back
      </button>

      <h2>Delivery History</h2>

      <div
        style={{
          width: "70%",
          margin: "auto",
          maxHeight: "70vh",
          overflowY: "scroll",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          backgroundColor: "#fafafa",
          marginTop: "20px"
        }}
      >
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              background: "white",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
              boxShadow: "0 0 4px rgba(0,0,0,0.1)"
            }}
          >
            <b>{log.action}</b>
            <br />
            <span style={{ fontSize: "14px", color: "gray" }}>
              {log.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeownerHistory;
