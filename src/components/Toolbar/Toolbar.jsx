import React, { useState, useEffect } from 'react';
import './Toolbar.css'; 
import CircularButton from '../CircularButton/CircularButton';
import ToolbarProfile from '../ToolbarProfile/ToolbarProfile';
import { auth } from '../../firebase'; 
import OffCanvasProfile from '../OffCanvasProfile/OffCanvasProfile';

function Toolbar() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="toolbar">
      <div className="toolbar__left">
        {/* Add any content or logo for the left side */}
      </div>

      <div className="toolbar__center">
        {/* Centered content */}
      </div>

      <div className="toolbar__right">
        {/* <div className="toolbar__actions">
          <CircularButton />
        </div> */}
        <div className="toolbar_profile">
          <ToolbarProfile />
        </div>
        <i className="material-symbols-outlined icon_menu" onClick={handleShow}>
          menu_open
        </i>
      </div>

      {/* Updated OffcanvasProfile component with the new design */}
      <OffCanvasProfile show={show} handleClose={handleClose} />
    </header>
  );
}

export default Toolbar;
