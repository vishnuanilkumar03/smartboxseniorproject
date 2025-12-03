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
      onLogin("dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: "10px" }}>SmartBox Login</h2>
      <p className="text-dim" style={{ marginBottom: "20px" }}>
        Sign in to access your Smart Dropbox.
      </p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p style={{ color: "#ff3b30", fontSize: "14px", marginTop: "4px" }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn" style={{ width: "100%", marginTop: "16px" }}>
          Log In
        </button>
      </form>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: "100%", marginTop: "14px" }}
        onClick={() => onLogin("register")}
      >
        Create Account
      </button>
    </div>
  );
}

export default Login;
