import React from 'react';
import './ToolbarProfile.css'; 

const ToolbarProfile = () => {
  return (
    <div className="toolbar-profile">
      <div className="profile-image">
        <i className="material-symbols-outlined person">person</i>
      </div>
      <button className="dropdown-button">
        <i className="material-symbols-outlined">arrow_drop_down</i>
      </button>
      <div className="profile-details"> 
        <div className="profile-name">Juan Dela Cruz</div>
        <div className="profile-position">SWK Staff</div>
      </div>
    </div>
  );
};

export default ToolbarProfile;
