import React, { useState, useEffect } from 'react';
import './App.css';
import SplashScreen from '../SplashScreen.jsx';

// Configure React Routing
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Login from './pages/Login/Login.jsx';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard.jsx';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard.jsx';

import bgImage from "./assets/bg.jpg"; // ✅ import background image

// A wrapper to handle splash on route change
function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show splash for 1.5s every time the route changes
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) return <SplashScreen />;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",       // ✅ scales to cover entire screen
        backgroundPosition: "center",  // ✅ keeps centered on all screens
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
