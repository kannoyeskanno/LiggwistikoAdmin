import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './Library.css';
import Lib from './Lib/Lib';
import Contribution from './Contribution/Contribution';

const Library = () => {
  const { email } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  
  // Fetch paths and other values from the query parameters
  const paths = queryParams.get('paths') ? JSON.parse(decodeURIComponent(queryParams.get('paths'))) : [];
  const language = queryParams.get('language') ? decodeURIComponent(queryParams.get('language')) : '';  
  const unapprovedCounts = queryParams.get('unapprovedCounts') ? JSON.parse(decodeURIComponent(queryParams.get('unapprovedCounts'))) : {};
  
  const selectedUnapprovedCount = unapprovedCounts[email] || 0;

  const [activeComponent, setActiveComponent] = useState('lib');

  const handleNavigation = (component) => {
    setActiveComponent(component);
  };

  return (
    <div className="library-container">
      <nav className="d-flex justify-content-start mb-4">
        <a href="#" className={activeComponent === 'lib' ? 'active' : ''} onClick={() => handleNavigation('lib')}>
          Library
        </a>
        <a href="#" className={activeComponent === 'contribution' ? 'active' : ''} onClick={() => handleNavigation('contribution')}>
          Contribution
        </a>
      </nav>

      <div className="library-content">
        {activeComponent === 'lib' ? (
          <Lib email={email} paths={paths} language={language} unapprovedCount={selectedUnapprovedCount} />
        ) : (
          <Contribution email={email} paths={paths} language={language} unapprovedCount={selectedUnapprovedCount} /> 
        )}
      </div>
      <h1>{language}</h1>
    </div>
  );
};

export default Library;
