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

    // VALIDATION — prevent empty fields
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
    } catch (err) {
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
    <div style={{ textAlign: "center", marginTop: "60px" }}>

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

      <h2>Homeowner Settings</h2>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
        />
        <br />

        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
        />
        <br />

        <input
          type="text"
          placeholder="Street Address"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
        />
        <br />

        <input
          type="text"
          placeholder="City"
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
        />
        <br />

        <input
          type="text"
          placeholder="State"
          value={form.state}
          onChange={(e) => updateField("state", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "120px" }}
        />

        <input
          type="text"
          placeholder="Zip"
          value={form.zip}
          onChange={(e) => updateField("zip", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "120px" }}
        />
        <br />

        <input
          type="email"
          value={form.email}
          disabled
          style={{
            padding: "10px",
            margin: "10px",
            width: "260px",
            backgroundColor: "#e5e5e5",
          }}
        />
        <br />

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

        {message && (
          <p style={{ marginTop: "15px", color: message.includes("Please") ? "red" : "green" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default HomeownerSettings;
