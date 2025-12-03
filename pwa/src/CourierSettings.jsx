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
    } catch {
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
    <div className="card">
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
        <button className="btn btn-secondary" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <h2>Courier Settings</h2>
      <p className="text-dim">Update your delivery contact details.</p>

      <input
        type="text"
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => updateField("name", e.target.value)}
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={form.phone}
        onChange={(e) => updateField("phone", e.target.value)}
      />

      <input
        type="email"
        value={form.email}
        disabled
        style={{ backgroundColor: "#1f1f1f" }}
      />

      {message && (
        <p
          style={{
            marginTop: "8px",
            color: message.includes("Please") ? "#ff3b30" : "#28cd41",
          }}
        >
          {message}
        </p>
      )}

      <button
        className="btn"
        style={{ width: "100%", marginTop: "16px" }}
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
}

export default CourierSettings;
