import React from 'react';
import './DeleteModal.css'; // Import CSS for styling

const CookieConsent = () => {
  const handleAccept = () => {
    // Logic to handle cookie consent acceptance
    console.log("Cookies accepted");
  };

  const handleDecline = () => {
    // Logic to handle cookie consent decline
    console.log("Cookies declined");
  };

  return (
    <div className="card-modal delete">
      <img src="" alt="Cookies" />
      <p className="cookieHeading">We use cookies.</p>
      <p className="cookieDescription">
        We use cookies to ensure that we give you the best experience on our website. <br />
        <a href="#">Read cookies policies</a>.
      </p>

      <div className="buttonContainer">
        <button className="acceptButton" onClick={handleAccept}>
          Allow
        </button>
        <button className="declineButton" onClick={handleDecline}>
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
