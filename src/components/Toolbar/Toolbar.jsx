import React, { useState, useEffect } from 'react';
import './Toolbar.css'; 
import CircularButton from '../CircularButton/CircularButton';
import ToolbarProfile from '../ToolbarProfile/ToolbarProfile';
import { Button, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { auth } from '../../firebase'; 

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
      </div>

      <div className="toolbar__center">
      </div>

      <div className="toolbar__right">
        <div className="toolbar__actions">
          <CircularButton />
        </div>
        <div className="toolbar_profile">
          <ToolbarProfile />
        </div>
          <i className="material-symbols-outlined icon_menu" onClick={handleShow}>menu_open</i>

      </div>

      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Off-Canvas Title</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {user ? (
            <div>
              <h5>Welcome, {user.displayName || 'User'}!</h5>
              <p>Email: {user.email}</p>
              <Button variant="secondary" onClick={() => auth.signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <p>Please log in.</p>
          )}
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}

export default Toolbar;
