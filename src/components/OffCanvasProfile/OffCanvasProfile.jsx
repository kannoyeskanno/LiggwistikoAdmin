// OffCanvasProfile.js
import React, { useState, useEffect } from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { auth } from '../../firebase'; // Ensure Firebase is correctly configured
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is included
import './OffCanvasProfile.module.css'; // Import CSS for styling

const OffCanvasProfile = ({ show, handleClose }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" className="offcanvas-profile">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Profile</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {user ? (
          <div className="profile-content">
            <div className="profile-image">
              <img src={user.photoURL || "default-profile.png"} alt="Profile" />
            </div>
            <div className="profile-details">
              <h5 className="profile-name">{user.displayName || 'User'}</h5>
              <p className="profile-email">{user.email}</p>
              <p className="profile-position">Software Engineer</p> {/* Adjust as needed */}
              <Button variant="primary" onClick={() => auth.signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <p>Please log in.</p>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default OffCanvasProfile;
