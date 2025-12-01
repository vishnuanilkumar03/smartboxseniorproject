// src/App.jsx
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import CourierDashboard from "./CourierDashboard";
import CourierSettings from "./CourierSettings";
import HomeownerSettings from "./HomeownerSettings";
import HomeownerHistory from "./HomeownerHistory";
import { auth, db } from "./firebase";
import { ref, get } from "firebase/database";

function App() {
  const [page, setPage] = useState("login");
  const [role, setRole] = useState(null);

  const handleLoginSuccess = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const snapshot = await get(ref(db, `users/${uid}/role`));
    const userRole = snapshot.val();
    setRole(userRole);

    if (userRole === "courier") setPage("courier");
    else setPage("dashboard");
  };

  const handleLogout = () => {
    setPage("login");
    setRole(null);
  };

  return (
    <>
      {page === "login" && (
        <Login
          onLogin={(toPage) => {
            if (toPage === "register") setPage("register");
            else handleLoginSuccess();
          }}
        />
      )}

      {page === "register" && <Register onRegister={() => setPage("login")} />}

      {page === "dashboard" && (
        <Dashboard
          onLogout={handleLogout}
          onSettings={() => setPage("homeowner-settings")}
          onHistory={() => setPage("homeowner-history")}
        />
      )}

      {page === "homeowner-settings" && (
        <HomeownerSettings
          onBack={() => setPage("dashboard")}
          onLogout={handleLogout}
        />
      )}

      {page === "homeowner-history" && (
        <HomeownerHistory onBack={() => setPage("dashboard")} />
      )}

      {page === "courier" && (
        <CourierDashboard
          onLogout={handleLogout}
          onSettings={() => setPage("courier-settings")}
        />
      )}

      {page === "courier-settings" && (
        <CourierSettings
          onBack={() => setPage("courier")}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
