// src/CourierDashboard.jsx
import { useState } from "react";
import { db, auth } from "./firebase";
import { ref, set } from "firebase/database";
import { signOut } from "firebase/auth";

function CourierDashboard({ onLogout, onSettings }) {
  const [message, setMessage] = useState("");
  const [currentAddress, setCurrentAddress] = useState("Press Next Address");

  const addresses = [
    "123 Maple St, Fremont, CA 94536",
    "422 Palm Dr, San Jose, CA 95123",
    "88 Creekside Ln, Union City, CA 94587",
    "1567 Forest Ave, Newark, CA 94560",
    "900 Brookstone Ct, Milpitas, CA 95035",
    "77 Sunset Blvd, Hayward, CA 94541",
    "543 Oak Grove Rd, Pleasanton, CA 94588",
  ];

  const handleNextAddress = () => {
    const randomIndex = Math.floor(Math.random() * addresses.length);
    setCurrentAddress(addresses[randomIndex]);
    setMessage("");
  };

  const handleArrival = async () => {
    try {
      await set(ref(db, "devices/box1/courier_signal"), "ARRIVED");
      setMessage("Signal sent! Please scan NFC...");
    } catch (err) {
      setMessage("Failed to send signal.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>

      {/* SETTINGS BUTTON */}
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
          cursor: "pointer",
        }}
      >
        Settings
      </button>

      {/* LOGOUT BUTTON */}
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
          cursor: "pointer",
        }}
      >
        Log Out
      </button>

      <h2>Courier Delivery Panel</h2>

      {/* ADDRESS DISPLAY */}
      <h3 style={{ marginTop: "20px" }}>Next Delivery Address:</h3>
      <p style={{ fontSize: "18px", fontWeight: "bold" }}>{currentAddress}</p>

      <button
        onClick={handleNextAddress}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginTop: "15px",
          backgroundColor: "orange",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Next Address
      </button>

      <hr style={{ marginTop: "40px", width: "60%" }} />

      {/* ARRIVAL BUTTON */}
      <p>Please press when you arrive.</p>

      <button
        onClick={handleArrival}
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          marginTop: "10px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        I'm Here
      </button>

      {/* NFC MESSAGE */}
      {message && (
        <p style={{ marginTop: "20px", fontSize: "18px", color: "green" }}>
          {message}
        </p>
      )}

      <h3 style={{ marginTop: "40px", color: "orange" }}>
        Please Scan Your NFC Tag
      </h3>
    </div>
  );
}

export default CourierDashboard;
