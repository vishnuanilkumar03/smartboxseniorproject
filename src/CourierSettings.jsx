// src/CourierSettings.jsx
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { ref, get, update } from "firebase/database";
import { signOut } from "firebase/auth";

function CourierSettings({ onBack, onLogout }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [message, setMessage] = useState("");

  // Load courier data on page load
  useEffect(() => {
    const uid = auth.currentUser?.uid;

    async function fetchData() {
      if (!uid) return;
      const snapshot = await get(ref(db, `users/${uid}`));
      const data = snapshot.val();

      if (data) {
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
        });
      }
    }

    fetchData();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // ⭐ REQUIRED FIELD CHECK
    if (!form.name.trim() || !form.phone.trim()) {
      setMessage("Please fill out all fields before saving.");
      return;
    }

    try {
      await update(ref(db, `users/${uid}`), {
        name: form.name,
        phone: form.phone,
      });

      setMessage("Changes saved!");
    } catch (err) {
      setMessage("Failed to save changes.");
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
    <div style={{ textAlign: "center", marginTop: "60px" }}>

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
          cursor: "pointer",
        }}
      >
        ⬅ Back
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

      <h2>Courier Settings</h2>

      <div style={{ marginTop: "20px" }}>
        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          style={{
            padding: "10px",
            margin: "10px",
            width: "260px",
          }}
        />
        <br />

        {/* PHONE */}
        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          style={{
            padding: "10px",
            margin: "10px",
            width: "260px",
          }}
        />
        <br />

        {/* EMAIL (LOCKED) */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          disabled
          style={{
            padding: "10px",
            margin: "10px",
            width: "260px",
            backgroundColor: "#dfdfdf",
          }}
        />
        <br />

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Save Changes
        </button>

        {/* MESSAGE */}
        {message && (
          <p
            style={{
              marginTop: "15px",
              color: message.includes("Please") ? "red" : "green",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default CourierSettings;
