import React, { useState, useEffect } from 'react';
import './App.css';
import SplashScreen from '../SplashScreen.jsx';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Login from './pages/Login/Login.jsx';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard.jsx';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard.jsx';

function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) return <SplashScreen />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
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
