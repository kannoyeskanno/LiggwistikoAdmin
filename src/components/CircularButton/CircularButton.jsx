import React, { useState } from "react"; 
import "./CircularButton.css";

const CircularButton = () => {
  const [hasNewNotification, setHasNewNotification] = useState(true); 

  const handleHomeClick = () => {
    console.log("Home button clicked");
  };

  const handleProfileClick = () => {
    setHasNewNotification(false); 
    console.log("Profile button clicked");
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
    </div>
  );
};

export default CircularButton;
