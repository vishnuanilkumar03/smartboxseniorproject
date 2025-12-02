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

      const rotatingTokenPayload = {
        courier: auth.currentUser?.uid || "unknown",
        timestamp: Date.now(),
        nonce: crypto.randomUUID(),
        token: "TEMP_TEST_TOKEN"
      };
      console.log("Sending token to Android...", rotatingTokenPayload);
      sendNfcTokenToAndroid(rotatingTokenPayload);

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

  function sendNfcTokenToAndroid(tokenPayload) {
    const jsonString = JSON.stringify(tokenPayload);

    if (window.AndroidHCE && window.AndroidHCE.sendToken) {
      try {
        window.AndroidHCE.sendToken(jsonString);
        console.log("Token sent to Android HCE:", jsonString);
      } catch (error) {
        console.error("Error sending NFC token:", error);
      }
    } else {
      console.log("AndroidHCE bridge not available (running in browser)");
    }
  }


  return (
    <div className="card-wide">
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

      <h2>Courier Delivery Panel</h2>
      <p className="text-dim">
        View your next drop location and unlock when you arrive.
      </p>

      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          borderRadius: "12px",
          background: "#151515",
          border: "1px solid var(--border)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Next Delivery Address</h3>
        <p style={{ fontSize: "17px", fontWeight: "bold" }}>{currentAddress}</p>

        <button
          onClick={handleNextAddress}
          className="btn btn-secondary"
          style={{ marginTop: "10px" }}
        >
          Next Address
        </button>
      </div>

      <div
        style={{
          marginTop: "28px",
          padding: "16px",
          borderRadius: "12px",
          background: "#151515",
          border: "1px solid var(--border)",
        }}
      >
        <p>Please press the button when you arrive at the SmartBox.</p>

        <button
          onClick={handleArrival}
          className="btn"
          style={{ marginTop: "10px" }}
        >
          I'm Here
        </button>

        {message && (
          <p style={{ marginTop: "12px", color: "#28cd41" }}>{message}</p>
        )}

        <h3 style={{ marginTop: "24px", color: "var(--accent-glow)" }}>
          Please Scan Your NFC Tag
        </h3>
        <p className="text-dim">The SmartBox will unlock after validation.</p>
      </div>
    </div>
  );
}

export default CourierDashboard;
