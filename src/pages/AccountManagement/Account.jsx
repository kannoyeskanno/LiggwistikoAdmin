import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase'; 
import './Account.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ListGroup from 'react-bootstrap/ListGroup';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import EmailComposeForm from '../../components/EmailComposeForm/EmailComposeForm';

const Account = () => {
  const [validators, setValidators] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false); 
  const [selectedValidator, setSelectedValidator] = useState(null); 
  const [newValidator, setNewValidator] = useState({
    name: '',
    email: '',
    language: '',
    otherInfo: '',
  });

  useEffect(() => {
    const fetchValidators = async () => {
      const querySnapshot = await getDocs(collection(db, 'validators'));
      const validatorsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setValidators(validatorsList);
    };

    fetchValidators();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewValidator((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'validators'), newValidator);
      setValidators([...validators, newValidator]);
      setShowModal(false); 
      setNewValidator({
        name: '',
        email: '',
        language: '',
        otherInfo: '',
      });
    } catch (error) {
      console.error('Error adding validator: ', error);
    }
  };

  const handleValidatorClick = (validator) => {
    setSelectedValidator(validator); 
  };

  const handleSendEmail = (emailData) => {
    const { subject, body } = emailData;
    const email = selectedValidator.email;

    console.log('Sending email to:', email);
    console.log('Subject:', subject);
    console.log('Body:', body);

    setShowEmailForm(false);
  };

  return (
    <div className="account-container">
      <div className="top-container">
        <h1>Account</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Validator
        </Button>
      </div>

      <div className="validators-section">
        <div className="validators-list">
          <ListGroup>
            {validators.length > 0 ? (
              validators.map((validator) => (
                <ListGroup.Item
                  key={validator.id}
                  onClick={() => handleValidatorClick(validator)} 
                  style={{ cursor: 'pointer' }}
                >
                  {validator.name} - {validator.email} - {validator.language}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>No Validators Found</ListGroup.Item>
            )}
          </ListGroup>
        </div>

        {selectedValidator && (
          <div className="validator-details">
            <h3>Validator Details</h3>
            <p><strong>Name:</strong> {selectedValidator.name}</p>
            <p><strong>Email:</strong> {selectedValidator.email}</p>
            <p><strong>Language:</strong> {selectedValidator.language}</p>
            {selectedValidator.otherInfo && (
              <p><strong>Other Info:</strong> {selectedValidator.otherInfo}</p>
            )}
            <Button
              variant="outline-primary"
              onClick={() => setShowEmailForm(true)} 
              className="compose-email-btn"
            >
              Compose Email
            </Button>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Validator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Validator Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newValidator.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newValidator.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                name="language"
                value={newValidator.language}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Other Info</Form.Label>
              <Form.Control
                type="text"
                name="otherInfo"
                value={newValidator.otherInfo}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="success" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {showEmailForm && selectedValidator && (
    <div className="bottom-right-email-form">
      <EmailComposeForm
        selectedValidator={selectedValidator}
        onCancel={() => setShowEmailForm(false)}
        onSend={handleSendEmail}
      />
    </div>
  )}
    </div>
  );
};

export default Account;
