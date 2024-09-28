import React, { useState, useEffect } from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { auth } from '../../firebase'; // Ensure Firebase is correctly configured
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is included
import './OffCanvasProfile.css'; // Import CSS for styling

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
        <Offcanvas.Title>Profile Details</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {user ? (
          <div className="profile-content">
            <div className="profile-image">
              asdasdasd
              <img src={user.photoURL || "/default-profile.png"} alt="Profile" />
            </div>
            <div className="profile-details">
              <h5 className="profile-name">{user.displayName || 'User'}</h5>
              <p className="profile-email">{user.email}</p>
              <p className="profile-position">Software Engineer</p> {/* Adjust this field */}
              <div className="profile-extra">
                <p><strong>Location:</strong> San Francisco, CA</p> {/* Optional field */}
                <p><strong>Joined:</strong> January 2023</p> {/* Optional field */}
              </div>
              <Button variant="primary" onClick={() => auth.signOut()} className="signout-button">
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <p className="login-message">Please log in to view your profile.</p>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default OffCanvasProfile;
