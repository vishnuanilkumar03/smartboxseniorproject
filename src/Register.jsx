// src/Register.jsx
import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

function Register({ onRegister }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Determine courier or homeowner based on email
      const courierDomains = ["amazon.com", "ups.com", "fedex.com", "dhl.com"];
      const emailDomain = form.email.split("@")[1]?.toLowerCase();

      const role = courierDomains.includes(emailDomain)
        ? "courier"
        : "homeowner";

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = userCredential.user.uid;

      // Save user profile data in Realtime Database
      await set(ref(db, `users/${uid}`), {
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        phone: form.phone,
        email: form.email,
        role: role, // <-- saves courier or homeowner
      });

      onRegister("login"); // go to login next
    } catch (err) {
      if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to create account. Try again.");
      }
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Create SmartBox Account</h2>

      <form onSubmit={handleRegister} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
          required
        />
        <br />

        <input
          type="text"
          placeholder="Street Address"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
          required
        />
        <br />

        <input
          type="text"
          placeholder="City"
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
          required
        />
        <br />

        <input
          type="text"
          placeholder="State"
          value={form.state}
          onChange={(e) => updateField("state", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "120px" }}
          required
        />

        <input
          type="text"
          placeholder="ZIP"
          value={form.zip}
          onChange={(e) => updateField("zip", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "120px" }}
          required
        />
        <br />

        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
          required
        />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
          required
        />
        <br />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "260px" }}
          required
        />
        <br />

        <button
          type="submit"
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
          Register
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}

      <button
        onClick={() => onRegister("login")}
        style={{
          marginTop: "20px",
          backgroundColor: "gray",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Back to Login
      </button>
    </div>
  );
}

export default Register;
