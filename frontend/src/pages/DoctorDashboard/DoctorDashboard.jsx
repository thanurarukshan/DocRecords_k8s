// DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import './DoctorDashboard.css';
import { useLocation } from "react-router-dom";

function DoctorDashboard() {
  const location = useLocation();
  const { user } = location.state || {}; // doctor object from login

  const [doctorProfile, setDoctorProfile] = useState({});
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [newPrescription, setNewPrescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isAddPrescriptionModalOpen, setAddPrescriptionModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (user) {
      setDoctorProfile(user);
      setEditForm({
        fullName: user.fullName || "",
        age: user.age || "",
        birthday: user.birthday ? user.birthday.split("T")[0] : "",
        mobile: user.mobile || "",
        email: user.email || "",
        gender: user.gender || "",
        mbbsReg: user.mbbsReg || "",
      });
    }
  }, [user]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSave = async () => {
    try {
      if (!editForm.fullName) {
        alert("Full Name is required!");
        return;
      }

      const payload = {
        email: editForm.email || "",
        full_name: editForm.fullName,
        age: editForm.age || null,
        gender: editForm.gender || null,
        birthday: editForm.birthday || null,
        mobile: editForm.mobile || "",
        mbbs_reg: editForm.mbbsReg || null,
      };

      const response = await fetch(`http://localhost:4000/profile/users/${doctorProfile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setDoctorProfile({ ...doctorProfile, ...editForm });
        setEditModalOpen(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + data.message);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred while updating profile.");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:4000/profile/users/${doctorProfile.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Profile deleted successfully!");
        window.location.href = "http://localhost:5173";
      } else {
        const data = await response.json();
        alert("Failed to delete profile: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting profile:", err);
      alert("An error occurred while deleting profile.");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleLogoutConfirm = () => {
    window.location.href = "http://localhost:5173";
  };

  // Fetch patient info by ID
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!patientId) return;

    setLoading(true);
    try {
      const patientRes = await fetch(`http://localhost:4000/patient/patients/${patientId}`);
      if (!patientRes.ok) throw new Error("Patient not found");
      const patientData = await patientRes.json();

      const historyRes = await fetch(`http://localhost:4000/prescription/medical-history/${patientId}`);
      let medicalHistory = [];
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        medicalHistory = historyData.medicalHistory || [];
      }

      setPatient({ ...patientData, medicalHistory });
    } catch (error) {
      console.error(error);
      setPatient(null);
      alert('Patient not found!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescription = async () => {
    if (!newPrescription || !patient) return;

    try {
      const response = await fetch(`http://localhost:4000/prescription/add-prescription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.user_id,
          doctor_id: doctorProfile.id,
          prescription: newPrescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to save prescription");
      const savedConsultation = await response.json();

      setPatient((prev) => ({
        ...prev,
        medicalHistory: savedConsultation.medicalHistory,
      }));

      setNewPrescription('');
      setAddPrescriptionModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to add prescription");
    }
  };

  return (
    <div className="doctor-dashboard">
      <h2>Welcome, {doctorProfile.fullName || "Doctor"}</h2>

      <section className="profile-section">
        <h3>Your Profile</h3>
        <div className="profile-card">
          <div className="profile-grid">
            <p><strong>User ID:</strong> {doctorProfile.id || "-"}</p>
            <p><strong>Full Name:</strong> {doctorProfile.fullName || "-"}</p>
            <p><strong>Age:</strong> {doctorProfile.age || "-"}</p>
            <p><strong>Gender:</strong> {doctorProfile.gender || "-"}</p>
            <p><strong>Birthday:</strong> {doctorProfile.birthday ? new Date(doctorProfile.birthday).toLocaleDateString() : "-"}</p>
            <p><strong>Mobile:</strong> {doctorProfile.mobile || "-"}</p>
            <p><strong>Email:</strong> {doctorProfile.email || "-"}</p>
            <p><strong>MBBS Reg No:</strong> {doctorProfile.mbbsReg || "-"}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button className="edit-btn" onClick={() => setEditModalOpen(true)}>Edit Profile</button>
          <button className="delete-btn" onClick={() => setDeleteModalOpen(true)}>Delete Profile</button>
          <button className="logout-btn" onClick={() => setLogoutModalOpen(true)}>Logout</button>
        </div>
      </section>

      {/* Patient search and info */}
      <section className="search-section">
        <h3>Search Patient</h3>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </section>

      {patient && (
        <section className="patient-section">
          <h3>Patient Info</h3>
          <div className="patient-card">
            <div className="profile-grid">
              <p><strong>Full Name:</strong> {patient.full_name}</p>
              <p><strong>Age:</strong> {patient.age}</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              <p><strong>Patient ID:</strong> {patient.user_id}</p>
            </div>
            <div className="patient-actions">
              <button className="add-prescription-btn" onClick={() => setAddPrescriptionModalOpen(true)}>Add Prescription</button>
            </div>
          </div>

          <h3>Medical History</h3>
          <div className="history-cards">
            {patient.medicalHistory?.length > 0 ? (
              patient.medicalHistory.map((record, index) => (
                <div key={index} className="history-card">
                  <p><strong>Date:</strong> {new Date(record.visit_date).toLocaleDateString()}</p>
                  <p><strong>Prescription:</strong> {record.prescription}</p>
                </div>
              ))
            ) : (
              <p>No medical history available.</p>
            )}
          </div>
        </section>
      )}

      {/* Add Prescription Modal */}
      {isAddPrescriptionModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Prescription</h3>
            <textarea
              placeholder="Enter prescription details"
              value={newPrescription}
              onChange={(e) => setNewPrescription(e.target.value)}
              rows={5}
            />
            <div className="modal-actions">
              <button className="save-btn" onClick={handleAddPrescription}>Save</button>
              <button className="cancel-btn" onClick={() => setAddPrescriptionModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Profile</h3>
            <input type="text" name="fullName" value={editForm.fullName} onChange={handleEditChange} placeholder="Full Name" />
            <input type="number" name="age" value={editForm.age} onChange={handleEditChange} placeholder="Age" />
            <input type="date" name="birthday" value={editForm.birthday} onChange={handleEditChange} />
            <input type="text" name="mobile" value={editForm.mobile} onChange={handleEditChange} placeholder="Mobile" />
            <input type="email" name="email" value={editForm.email} onChange={handleEditChange} placeholder="Email" />
            <input type="text" name="gender" value={editForm.gender} onChange={handleEditChange} placeholder="Gender (optional)" />
            <input type="text" name="mbbsReg" value={editForm.mbbsReg} onChange={handleEditChange} placeholder="MBBS Reg No (optional)" />
            <div className="modal-actions">
              <button className="save-btn" onClick={handleEditSave}>Save</button>
              <button className="cancel-btn" onClick={() => setEditModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete your profile?</h3>
            <div className="modal-actions">
              <button className="delete-btn" onClick={handleDeleteConfirm}>Yes, Delete</button>
              <button className="cancel-btn" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-actions">
              <button className="logout-btn" onClick={handleLogoutConfirm}>Yes, Logout</button>
              <button className="cancel-btn" onClick={() => setLogoutModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
