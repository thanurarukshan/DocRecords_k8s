// PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';
import { useLocation } from "react-router-dom";

function PatientDashboard() {
  const location = useLocation();
  const { user } = location.state || {}; // user object passed from login page

  const [profile, setProfile] = useState({});
  const [history, setHistory] = useState([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (user) {
      setProfile(user);
      setEditForm({
        fullName: user.fullName || "",
        age: user.age || "",
        birthday: user.birthday ? user.birthday.split("T")[0] : "",
        mobile: user.mobile || "",
        email: user.email || "",
        gender: user.gender || "",
        mbbs_reg: user.mbbs_reg || ""
      });

      const fetchMedicalHistory = async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/prescription/medical-history/${user.id}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = await response.json();
          if (response.ok) {
            setHistory(data.medicalHistory || []);
          } else {
            console.error("Failed to fetch medical history:", data.message);
          }
        } catch (err) {
          console.error("Error fetching medical history:", err);
        }
      };

      fetchMedicalHistory();
    }
  }, [user]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // push data to api-gateway
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
        birthday: editForm.birthday || null, // YYYY-MM-DD format
        mobile: editForm.mobile || "",
        mbbs_reg: editForm.mbbs_reg || null,
      };

      const response = await fetch(`http://localhost:4000/profile/users/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile({ ...profile, ...editForm });
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

  //handle delete function
  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:4000/profile/users/${profile.id}`, {
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

  return (
    <div className="patient-dashboard">
      <h2>Welcome, {profile.fullName || "Patient"}</h2>

      <section className="profile-section">
        <h3>Your Profile</h3>
        <div className="profile-card">
          <div className="profile-grid">
            <p><strong>User ID:</strong> {profile.id || "-"}</p>
            <p><strong>Full Name:</strong> {profile.fullName || "-"}</p>
            <p><strong>Age:</strong> {profile.age || "-"}</p>
            <p><strong>Gender:</strong> {profile.gender || "-"}</p>
            <p><strong>Birthday:</strong> {profile.birthday ? new Date(profile.birthday).toLocaleDateString() : "-"}</p>
            <p><strong>Mobile:</strong> {profile.mobile || "-"}</p>
            <p><strong>Email:</strong> {profile.email || "-"}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button className="edit-btn" onClick={() => setEditModalOpen(true)}>Edit Profile</button>
          <button className="delete-btn" onClick={() => setDeleteModalOpen(true)}>Delete Profile</button>
          <button className="logout-btn" onClick={() => setLogoutModalOpen(true)}>Logout</button>
        </div>
      </section>

      <section className="history-section">
        <h3>Medical History</h3>
        <div className="history-cards">
          {history.length > 0 ? (
            history.map(record => (
              <div key={record.consultation_id} className="history-card">
                <p><strong>Date:</strong> {new Date(record.visit_date).toLocaleDateString()}</p>
                <p><strong>Doctor:</strong> {record.doctor_name || record.doctor_id}</p>
                <p><strong>Prescription:</strong> {record.prescription}</p>
              </div>
            ))
          ) : (
            <p>No medical history available.</p>
          )}
        </div>
      </section>

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
            <input type="text" name="mbbs_reg" value={editForm.mbbs_reg} onChange={handleEditChange} placeholder="MBBS Reg No (optional)" />
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

export default PatientDashboard;
