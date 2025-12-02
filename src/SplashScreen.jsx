import React, { useEffect, useState } from "react";
import "./splash.css";

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start animation after 1.2 sec
    setTimeout(() => setFadeOut(true), 1200);

    // Finish splash after animation completes
    setTimeout(() => onFinish(), 2300);
  }, []);

  return (
    <div className={`splash-container ${fadeOut ? "fade-out" : ""}`}>
      <div className="splash-content">
        <h1 className="splash-title">SMART LOCKBOX</h1>
        <img src="/logo1.png" className="splash-logo-big" />
        <p className="splash-welcome">Welcome</p>
      </div>

      <img src="/logo2.png" className={`transition-logo ${fadeOut ? "show" : ""}`} />
    </div>
  );
}
