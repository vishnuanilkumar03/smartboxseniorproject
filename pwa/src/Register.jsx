// src/Register.jsx
import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

function Register({ onRegister }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const getRoleFromEmail = (email) => {
    const lower = email.toLowerCase();
    const courierDomains = ["@amazon.com", "@ups.com", "@fedex.com", "@dhl.com"];

    if (courierDomains.some((d) => lower.endsWith(d))) return "courier";
    return "homeowner";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.zip.trim()
    ) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const uid = cred.user.uid;
      const role = getRoleFromEmail(form.email);

      await set(ref(db, `users/${uid}`), {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        email: form.email,
        role,
      });

      setMessage("Account created successfully. You can now log in.");
      onRegister();
    } catch (err) {
      console.error(err);
      setError("Error creating account.");
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: "10px" }}>Create SmartBox Account</h2>
      <p className="text-dim" style={{ marginBottom: "18px" }}>
        Homeowners use personal emails, couriers use company emails.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Street Address"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="City"
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
          required
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="State"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Zip"
            value={form.zip}
            onChange={(e) => updateField("zip", e.target.value)}
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
        />

        {error && (
          <p style={{ color: "#ff3b30", fontSize: "14px", marginTop: "4px" }}>
            {error}
          </p>
        )}
        {message && (
          <p style={{ color: "#28cd41", fontSize: "14px", marginTop: "4px" }}>
            {message}
          </p>
        )}

        <button type="submit" className="btn" style={{ width: "100%", marginTop: "14px" }}>
          Create Account
        </button>
      </form>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: "100%", marginTop: "14px" }}
        onClick={onRegister}
      >
        Back to Login
      </button>
    </div>
  );
}

export default Register;
