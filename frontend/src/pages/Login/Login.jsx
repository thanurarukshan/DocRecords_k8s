import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from "react-router-dom";
import DocLogo from '../../assets/DocLogo.png';
import landingImage from '../../assets/landingImage.png';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // toggle login modal
  const [role, setRole] = useState('patient'); 
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    birthday: '',
    mobile: '',
    email: '',
    password: '',
    mbbsReg: '', 
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignup) {
        const payload = { ...formData, role };
        if (role !== "doctor") delete payload.mbbsReg;

        const response = await fetch("http://localhost:4000/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
          alert("Signup successful! Please login.");
          setIsSignup(false);
        } else {
          alert(data.message || "Signup failed!");
        }
      } else {
        const response = await fetch("http://localhost:4000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password, role }),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", role);

          const isDoctor = !!data.user.mbbsReg;

          if (role === "doctor") {
            if (!isDoctor) {
              alert("You are not registered as a doctor. Cannot access Doctor Dashboard.");
              return;
            }
            navigate("/doctor", { state: { user: data.user } });
          } else {
            if (isDoctor) {
              alert("Doctors cannot access Patient Dashboard.");
              return;
            }
            navigate("/patient", { state: { user: data.user } });
          }
        } else {
          alert(data.message || "Login failed!");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Server error!");
    }
  };

  return (
    <div className='landing-page'>

      {/* ---------- Header ---------- */}
      <header className='headerbar'>
        <div className='logo-container'>
          <img src={DocLogo} alt="DocRecords" className="header-logo" />
          <span className="logo-text">DocRecords</span>
        </div>

        <nav className='nav-links'>
          <a href="#about">About Us</a>
          <a href="#contact">Contact Us</a>
          <button className="btn-login" onClick={() => setShowLogin(true)}>
            Sign In / Sign Up
          </button>
        </nav>
      </header>

      {/* ---------- Main Content ---------- */}
      <main className='site-container'>
        <img src={landingImage} alt='Landing Image' className='landingImage'/>
        <section className="hero-section">
          <h1>Welcome to DocRecords</h1>
          <p className='welcome-text'>“Your trusted partner in managing healthcare information. With DocRecords, your medical records are not just stored, but kept secure, organized, and always within reach. Whether you are a doctor tracking patient history or a patient wanting easy access to your health journey, we make it simple, reliable, and accessible anytime, anywhere. Experience the future of healthcare records with confidence, knowing your information is safe and available whenever you need it.”</p>
          <button className="btn-primary" onClick={() => setShowLogin(true)}>
            Get Started
          </button>
        </section>

        <section id="about" className="about-section">
          <h2>About Us</h2>
          <p className='aboutus-para'>At DocRecords, we believe that healthcare should be as seamless and efficient as possible not only for doctors and medical staff but also for patients who rely on accurate and accessible information. Our mission is to simplify the way medical records are created, stored, and shared, ensuring that both patients and healthcare professionals have secure, reliable access to the information they need, when they need it. <br/> <br/>

Founded with a vision to bridge the gap between traditional medical record systems and modern digital solutions, DocRecords provides a platform that combines security, accessibility, and ease of use. We understand the challenges that come with managing healthcare data from lost files and fragmented records to the difficulty of accessing past medical histories. With DocRecords, those challenges become a thing of the past.<br/> <br/>

Our platform is designed with patients and doctors in mind. Patients can take control of their health journey by accessing their complete records in one place, while doctors benefit from streamlined workflows, organized patient histories, and the ability to make better-informed medical decisions.<br/> <br/>

At the heart of DocRecords lies a commitment to privacy and data protection. We employ advanced encryption and compliance practices to ensure that sensitive medical information remains safe at all times. Whether you are a healthcare provider managing hundreds of patients or an individual tracking your personal health, our solution ensures that your data is handled with the highest level of care.<br/> <br/>

DocRecords is more than just a record-keeping tool it is a step toward the future of digital healthcare management. We are driven by innovation, guided by trust, and committed to making healthcare simpler, smarter, and more connected.</p>
        </section>
        <div className='contact-us'>
          <section id="contact" className="contact-section">
            <h2>Contact Us</h2>
            <p className='contact-us-text'>22ug1-0529@sltc.ac.lk | <a className='portfolio' href='https://thanurarukshan.web.app/'>thanurarukshan.web.app</a> | +94779371866</p>
          </section>
        </div>
      </main>

      {/* ---------- Login Modal ---------- */}
      {showLogin && (
        <div className="login-modal">
          <div className="login-container">
            <button className="close-btn" onClick={() => setShowLogin(false)}>×</button>
            <h2>{isSignup ? "Sign Up" : "Sign In"}</h2>
            <form className="login-form" onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                  <label>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required min="0" />
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <label>Birthday</label>
                  <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} required />
                  <label>Mobile No</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
                </>
              )}

              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />

              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />

              <div className="role-select">
                <label>
                  <input 
                    type="radio" 
                    value="patient" 
                    checked={role === "patient"} 
                    onChange={(e) => setRole(e.target.value)} 
                  />
                  Patient
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="doctor" 
                    checked={role === "doctor"} 
                    onChange={(e) => setRole(e.target.value)} 
                  />
                  Doctor
                </label>
              </div>

              {isSignup && role === 'doctor' && (
                <>
                  <label>MBBS Registration No</label>
                  <input type="text" name="mbbsReg" value={formData.mbbsReg} onChange={handleChange} required />
                </>
              )}

              <button type="submit" className="btn-primary">
                {isSignup ? "Sign Up" : "Sign In"}
              </button>
            </form>

            <p className="toggle-text">
              {isSignup ? "Already have an account?" : "Not a user?"}{" "}
              <button 
                type="button" 
                className="toggle-btn" 
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;
