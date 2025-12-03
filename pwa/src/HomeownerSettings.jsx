// src/HomeownerSettings.jsx
import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { ref, get, update } from "firebase/database";
import { signOut } from "firebase/auth";

function HomeownerSettings({ onBack, onLogout }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    email: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    async function loadData() {
      const snapshot = await get(ref(db, `users/${uid}`));
      const data = snapshot.val();
      if (data) {
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          email: data.email || "",
        });
      }
    }

    loadData();
  }, []);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.zip.trim()
    ) {
      setMessage("Please fill out all fields before saving.");
      return;
    }

    try {
      await update(ref(db, `users/${uid}`), {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
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
      console.error(err);
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

      <h2>Homeowner Settings</h2>
      <p className="text-dim">Update your contact and address details.</p>

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
        type="text"
        placeholder="Street Address"
        value={form.address}
        onChange={(e) => updateField("address", e.target.value)}
      />
      <input
        type="text"
        placeholder="City"
        value={form.city}
        onChange={(e) => updateField("city", e.target.value)}
      />
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="State"
          value={form.state}
          onChange={(e) => updateField("state", e.target.value)}
        />
        <input
          type="text"
          placeholder="Zip"
          value={form.zip}
          onChange={(e) => updateField("zip", e.target.value)}
        />
      </div>

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

export default HomeownerSettings;
