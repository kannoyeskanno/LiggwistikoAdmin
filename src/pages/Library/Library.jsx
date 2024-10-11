import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './Library.css';
import Lib from './Lib/Lib';
import Contribution from './Contribution/Contribution';
import UpdatePush from './UpdatePush/UpdatePush';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';

const Library = () => {
  const { email } = useParams();
  const queryParams = new URLSearchParams(window.location.search);

  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null); 

  const handleClick = (event) => {
    setShow(true); 
    setTarget(event.target); 

    setTimeout(() => {
      setShow(false);
    }, 3000);
  };
  
  const paths = queryParams.get('paths') ? JSON.parse(decodeURIComponent(queryParams.get('paths'))) : [];
  const language = queryParams.get('language') ? decodeURIComponent(queryParams.get('language')) : '';  
  const unapprovedCounts = queryParams.get('unapprovedCounts') ? JSON.parse(decodeURIComponent(queryParams.get('unapprovedCounts'))) : {};
  
  const selectedUnapprovedCount = unapprovedCounts[email] || 0;

  const [activeComponent, setActiveComponent] = useState('lib');

  const handleNavigation = (component) => {
    setActiveComponent(component);
  };

  return (
    <div className="library-container" ref={ref}>
      <nav className="d-flex justify-content-start mb-4">
        <ul className='nav-holder'>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'lib' ? 'active' : ''} 
              onClick={() => handleNavigation('lib')}
            >
              Library
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'contribution' ? 'active' : ''} 
              onClick={() => handleNavigation('contribution')}
            >
              Contribution
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className={activeComponent === 'updatePush' ? 'active' : ''} 
              onClick={() => handleNavigation('updatePush')}
            >
              Update Push
            </a>
          </li>
          {selectedUnapprovedCount > 0 && (
            <div className="notification-circle" onClick={handleClick}>
              <span className="notification-badge">{selectedUnapprovedCount}</span>
            </div>
          )}
        </ul>
      </nav>

      <div className="library-content">
        {activeComponent === 'lib' && (
          <Lib email={email} paths={paths} language={language} unapprovedCount={selectedUnapprovedCount} />
        )}
        {activeComponent === 'contribution' && (
          <Contribution email={email} paths={paths} language={language} unapprovedCount={selectedUnapprovedCount} />
        )}
        {activeComponent === 'updatePush' && (
          <UpdatePush language={language} />
        )}
      </div>

      <Overlay
        show={show}
        target={target}
        placement="right"
        container={ref.current}
        containerPadding={20}
      >
        <Popover id="popover-contained">
          <Popover.Header as="h3">Unapproved Contributions</Popover.Header>
          <Popover.Body>
            <strong>{selectedUnapprovedCount}</strong> unapproved contributions for {email}.
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default Library;
