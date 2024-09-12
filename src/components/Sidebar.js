import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Navigation</h2>
      <ul>
        <li>
          <NavLink exact to="/dashboard" activeClassName="active">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" activeClassName="active">
            <span className="material-symbols-outlined">info</span>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" activeClassName="active">
            <span className="material-symbols-outlined">mail</span>
            Contact
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
