import React from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';

const Loading = () => {
  return (
    <Row className="justify-content-center mt-4">
      {[1, 2].map((_, index) => (
        <Col key={index} md={4} className="mb-4 d-flex justify-content-center">
          <Card className="profile-card placeholder-card" style={{ width: '18rem' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="image-profile me-3">
                <img src="https://via.placeholder.com/150" alt="placeholder" className="profile-image" />
              </div>
              <div className="text-details text-start">
                <h3 className="name placeholder-glow">
                  <span className="placeholder col-6"></span>
                </h3>
                <p className="role mb-1 placeholder-glow">
                  <span className="placeholder col-4"></span>
                </p>
                <p className="location placeholder-glow">
                  <span className="placeholder col-6"></span>
                </p>
              </div>
            </Card.Body>
            <Button variant="primary" className="w-100 disabled placeholder col-6" aria-disabled="true">
              Loading...
            </Button>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default Loading;
