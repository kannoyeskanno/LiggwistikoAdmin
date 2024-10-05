import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap styles are included
import './Analytics.module.scss'; // Change to SCSS

const Analytics = () => {
  const userCount = 150;
  const contributionCount = 75;
  const activeUsers = 120;
  const newUsers = 30;

  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div className="analytics-container">
      <div className="top-container">
        <h1>Analytics</h1>
        <Button variant="primary" onClick={handleShow}>
          Open Test Modal
        </Button>
      </div>
      <div className="metrics-container">
        <div className="metric">
          <h2>User Count</h2>
          <p>{userCount}</p>
        </div>
        <div className="metric">
          <h2>Contribution Count</h2>
          <p>{contributionCount}</p>
        </div>
        <div className="metric">
          <h2>Active Users</h2>
          <p>{activeUsers}</p>
        </div>
        <div className="metric">
          <h2>New Users</h2>
          <p>{newUsers}</p>
        </div>
      </div>

      {/* Modal Structure */}
      <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Test Modal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This is a test modal. You can add any content you want here.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Analytics;
