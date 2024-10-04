import React, { useState, useEffect } from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { auth } from '../../firebase'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './OffCanvasProfile.css';

const OffCanvasProfile = ({ show, handleClose }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
      },
      (error) => {
        console.error("Error fetching auth state: ", error);
      }
    );

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
              <img src={user.photoURL || "/default-profile.png"} alt={`${user.displayName || 'User'}'s profile`} />
            </div>
            <div className="profile-details">
              <h5 className="profile-name">{user.displayName || 'User'}</h5>
              <p className="profile-email">{user.email}</p>
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