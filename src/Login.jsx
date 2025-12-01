// src/Login.jsx
import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin("dashboard"); // go to app
    } catch (err) {
      setError("Invalid credentials.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>SmartBox Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "200px" }}
          required
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", margin: "10px", width: "200px" }}
          required
        />
        <br />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            marginTop: "10px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Register Button */}
      <button
        type="button"
        onClick={() => onLogin("register")}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginTop: "15px",
          backgroundColor: "gray",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Create Account
      </button>
    </div>
  );
}

export default Login;
