import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import './ToolbarProfile.css'; 
import { Offcanvas, Button } from 'react-bootstrap';
import { auth } from '../../firebase'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const ToolbarProfile = () => {
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="toolbar-profile">
      <div className="profile-image">
      <img src={user?.photoURL || "/default-profile.png"} alt="Profile" />
      </div>
      <button className="dropdown-button">
        <i className="material-symbols-outlined">arrow_drop_down</i>
      </button>
      <div className="profile-details"> 
        <h5 className="profile-name">{user?.displayName || 'User'}</h5>
        <div className="profile-position">SWK Validator</div>
      </div>
    </div>
  );
};

export default ToolbarProfile;