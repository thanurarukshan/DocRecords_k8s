import { useEffect, useState } from "react";
import DocLogo from "./src/assets/DocLogo.png";
import "./SplashScreen.css";

export default function SplashScreen({ onFinish }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onFinish(); // callback to hide splash
    }, 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!show) return null;

  return (
    <div className="splash-container">
      <img
        src={DocLogo}
        alt="Logo"
        className="splash-logo"
      />
    </div>
  );
}
