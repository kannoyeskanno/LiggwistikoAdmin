import React, { useState, useEffect } from "react";
import "./CircularButton.css";
import "bootstrap/dist/css/bootstrap.min.css"; 
import { Toast, ToastContainer } from "react-bootstrap";

const CircularButton = () => {
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    console.log("showToast state:", showToast);
  }, [showToast]);

  const handleHomeClick = () => {
    console.log("Home button clicked");
  };

  const handleProfileClick = () => {
    console.log("Profile button clicked");
    setHasNewNotification(false);
    setShowToast(true);
  };

  const handleSettingsClick = () => {
    console.log("Settings button clicked");
  };

  return (
    <div className="circular-button-container">
      <button className="circular-button" onClick={handleHomeClick}>
        <i className="material-symbols-outlined">home</i>
      </button>

      <button className="circular-button report" onClick={handleProfileClick}>
        <i className="material-symbols-outlined report">campaign</i>
        {hasNewNotification && <span className="notification-dot"></span>}
      </button>

      <button className="circular-button help" onClick={handleSettingsClick}>
        <i className="material-symbols-outlined help">help</i>
      </button>

      <ToastContainer position="top-center" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>Profile button clicked!</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default CircularButton;