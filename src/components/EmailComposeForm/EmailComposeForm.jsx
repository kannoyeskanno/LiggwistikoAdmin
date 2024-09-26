import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';  // Import your Firebase functions setup
import { Form, Button, FloatingLabel } from 'react-bootstrap';
import "./EmailComposeForm.css";

const EmailComposeForm = ({ selectedValidator, onCancel, onSend }) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
  });

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendEmail = (e) => {
    e.preventDefault();

    const sendEmail = httpsCallable(functions, 'sendEmail');  // Call the Cloud Function
    sendEmail({
      to: selectedValidator.email,  
      subject: emailData.subject,   
      body: emailData.body,          // Email body content
    })
    .then((result) => {
      console.log(result.data.message);  // Logs response from the Cloud Function
      onSend();                          // Call onSend after success
    })
    .catch((error) => {
      console.error('Error sending email:', error);
    });
  };

  return (
    <Form onSubmit={handleSendEmail}>
      <Form.Group className="mb-3">
        <FloatingLabel label="Subject">
          <Form.Control
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleEmailChange}
            required
          />
        </FloatingLabel>
      </Form.Group>
      <Form.Group className="mb-3">
        <FloatingLabel label="Body">
          <Form.Control
            as="textarea"
            name="body"
            value={emailData.body}
            onChange={handleEmailChange}
            style={{ height: '100px' }}
            required
          />
        </FloatingLabel>
      </Form.Group>
      <Button variant="success" type="submit">
        Send Email
      </Button>
      <Button
        variant="outline-secondary"
        onClick={onCancel}
        style={{ marginLeft: '10px' }}
      >
        Cancel
      </Button>
    </Form>
  );
};

export default EmailComposeForm;
