import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SWKlogo from "../../images/swk_logo.png";

import "./Sidebar.css";

import { Button, Offcanvas } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function Sidebar() {
  const location = useLocation();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  useEffect(() => {
    const toggle = document.querySelector(".toggle");
    const searchBTN = document.querySelector(".search-box");
    const sidebar = document.querySelector(".sidebar");
    const content = document.querySelector(".content");
    const toolbar = document.querySelector(".toolbar");
    const iconSearch = document.querySelector(".iconSearch");

    const handleToggleClick = () => {
      sidebar.classList.toggle("close");
      if (sidebar.classList.contains("close")) {
        content.style.marginLeft = "5%";
        content.style.width = "95%";
        toolbar.style.width = "95%";
        iconSearch.style.opacity = "1";
      } else {
        content.style.marginLeft = "12%";
        toolbar.style.width = "88%";
        content.style.width = "88%";

        iconSearch.style.opacity = "0";
      }
    };

    const handleSearchClick = () => {
      sidebar.classList.remove("close");
      content.style.marginLeft = "12%";
      toolbar.style.width = "88%";
      iconSearch.style.opacity = "0";
    };

    toggle.addEventListener("click", handleToggleClick);
    searchBTN.addEventListener("click", handleSearchClick);

    return () => {
      toggle.removeEventListener("click", handleToggleClick);
      searchBTN.removeEventListener("click", handleSearchClick);
    };
  }, []);
  return (
    <nav className="sidebar close">
      <header>
        <div className="image-text" onClick={handleShow}>
          <span className="image">
            <img src={SWKlogo} alt="logo" />
          </span>
          <div className="text header-text">
            <span className="name">SWK Bikol</span>
            <span className="tag">Sentro ng Wika at Kultura</span>
          </div>
        </div>
        <i className="material-symbols-outlined toggle">chevron_right</i>
      </header>
      <div className="menu-bar">
        <div className="menu">
          <li className="search-box">
            <i className="material-symbols-outlined iconSearch">search</i>
            <input type="text" placeholder="Search..." />
          </li>
          <ul className="menu-links">
            <li
              className={`nav-link ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <Link to="/dashboard">
                <i className="material-symbols-outlined icon">dashboard</i>
                <span className="text nav-text">Dashboard</span>
              </Link>
            </li>

            <li
              className={`nav-link ${
                location.pathname === "/userManagement" ? "active" : ""
              }`}
            >
              <Link to="/userManagement">
                <i className="material-symbols-outlined icon">
                  manage_accounts
                </i>
                <span className="text nav-text">Accounts</span>
              </Link>
            </li>

            <li
              className={`nav-link ${
                location.pathname === "/contributionManagement" ? "active" : ""
              }`}
            >
              <Link to="/contributionManagement">
                <i className="material-symbols-outlined icon">folder_shared</i>
                <span className="text nav-text">Contributions</span>
              </Link>
            </li>

            <li
              className={`nav-link ${
                location.pathname === "/dialectCategories" ? "active" : ""
              }`}
            >
              <Link to="/dialectCategories">
                <i className="material-symbols-outlined icon">category</i>
                <span className="text nav-text">Dialects</span>
              </Link>
            </li>

            <li
              className={`nav-link ${
                location.pathname === "/comments" ? "active" : ""
              }`}
            >
              <Link to="/comments">
                <i className="material-symbols-outlined icon">feedback</i>
                <span className="text nav-text">Comments</span>
              </Link>
            </li>
{/* 
            <li
              className={`nav-link ${
                location.pathname === "/analytics" ? "active" : ""
              }`}
            >
              <Link to="/analytics">
                <i className="material-symbols-outlined icon">analytics</i>
                <span className="text nav-text">Analytics</span>
              </Link>
            </li> */}

          
          </ul>
        </div>
      </div>
      <div className="bottom-content">
        <li
          className={`nav-link ${
            location.pathname === "/settings" ? "active" : ""
          }`}
        >
          <Link to="/settings">
            <i className="material-symbols-outlined icon">settings</i>
            <span className="text nav-text">Settings</span>
          </Link>
        </li>
      </div>

      <Offcanvas show={show} onHide={handleClose} placement="top">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Off-Canvas Title</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p>Please log in.</p>

          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </nav>
  );
}

export default Sidebar;
