import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import "./Contribution.css";
import { Modal, Button, Spinner, Alert, Form } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { addDoc, query, where, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database"; 

const Contribution = ({ email, language }) => {
  const [unapprovedContributions, setUnapprovedContributions] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [actionLoading, setActionLoading] = useState(false);  
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false); // Confirmation modal for approval
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedContribution, setEditedContribution] = useState({
    description: '',
    input_main: '',
    output_main: '',
    contributed_text: ''
  });

  useEffect(() => {
    const fetchUnapprovedContributions = async () => {
      try {
        const paths =
          language === "Daraga"
            ? [
                "translations/Filipino-Daraga/contributions",
                "translations/Daraga-Filipino/contributions",
              ]
            : language === "Cam Norte"
            ? [
                "translations/Cam Norte-Filipino/contributions",
                "translations/Filipino-Cam Norte/contributions",
              ]
            : [];

        const contributionsData = [];
        for (const path of paths) {
          const q = query(collection(db, path), where("approved", "==", false));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const contributions = snapshot.docs.map((doc) => ({
              id: doc.id,
              path,
              ...doc.data(),
            }));
            contributionsData.push(...contributions);
          }
        }

        setUnapprovedContributions(contributionsData);
      } catch (error) {
        setError("Failed to fetch contributions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnapprovedContributions();
  }, [language]);

  const handleApprove = (contribution) => {
    setSelectedContribution(contribution); // Set the selected contribution
    setShowApproveModal(true); // Show the confirmation modal
  };

  const confirmApprove = async () => {
    setActionLoading(true);
    try {
      const docRef = doc(db, selectedContribution.path, selectedContribution.id);
      await updateDoc(docRef, { approved: true });

      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email.replace(/\./g, "_");
        const dbRealtime = getDatabase();
        const userRef = ref(dbRealtime, `adminUpdateCollection/${userEmail}`);

        await set(ref(dbRealtime, `adminUpdateCollection/${userEmail}/language`), language || "");

        const contributionRef = ref(dbRealtime, `adminUpdateCollection/${userEmail}/approvedContributions/${selectedContribution.id}`);
        await set(contributionRef, {
          input_main: selectedContribution.input_main,
          contributed_text: selectedContribution.contributed_text,
          status: "",
          timestamp: selectedContribution.timestamp ? selectedContribution.timestamp.toDate().toISOString() : null,
        });
      }

      setUnapprovedContributions((prev) =>
        prev.filter((contributionItem) => contributionItem.id !== selectedContribution.id)
      );
    } catch (error) {
      console.error("Error approving contribution: ", error);
    } finally {
      setActionLoading(false);
      setShowApproveModal(false); // Hide the modal after approval
    }
  };

  const handleReject = (contribution) => {
    setSelectedContribution(contribution);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      await handleDelete(selectedContribution);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting contribution: ", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (contribution) => {
    try {
      const notifyRef = collection(db, `notifyUser/${contribution.user_email}/deletedContributions`);
      await addDoc(notifyRef, {
        timestamp: contribution.timestamp ? contribution.timestamp.toDate() : null,
        user_email: contribution.user_email,
        description: contribution.description,
        input_main: contribution.input_main,
        output_main: contribution.output_main,
        contributed_text: contribution.contributed_text,
        image_url: contribution.image_url || null,
        status: "Deleted",
      });

      const docRef = doc(db, contribution.path, contribution.id);
      await deleteDoc(docRef);

      setUnapprovedContributions((prev) =>
        prev.filter((contributionItem) => contributionItem.id !== contribution.id)
      );
    } catch (error) {
      console.error("Error deleting contribution: ", error);
    }
  };

  const handleEditModal = (contribution) => {
    setSelectedContribution(contribution);
    setEditedContribution({
      description: contribution.description,
      input_main: contribution.input_main,
      output_main: contribution.output_main,
      contributed_text: contribution.contributed_text,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedContribution((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (selectedContribution) {
      const docRef = doc(db, selectedContribution.path, selectedContribution.id);

      setActionLoading(true);
      try {
        await updateDoc(docRef, editedContribution);
        setUnapprovedContributions((prev) =>
          prev.map((contribution) =>
            contribution.id === selectedContribution.id
              ? { ...contribution, ...editedContribution }
              : contribution
          )
        );
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating contribution: ", error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleShowImage = (contribution) => {
    setSelectedContribution(contribution);
    setShowImageModal(true);
  };

  return (
    <div className="contribution-container">
      {loading ? (
        <div className="spinner-container">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <table className="contribution-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User Email</th>
              <th>Description</th>
              <th>Filipino</th>
              <th>{language}</th>
              <th>Submitted Translation</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unapprovedContributions.length > 0 ? (
              unapprovedContributions.map((contribution) => (
                <tr key={contribution.id}>
                  <td>{contribution.timestamp ? new Date(contribution.timestamp.toDate()).toLocaleString() : "No Timestamp Available"}</td>
                  <td>{contribution.user_email}</td>
                  <td>{contribution.description}</td>
                  <td>{contribution.input_main}</td>
                  <td>{contribution.output_main}</td>
                  <td>{contribution.contributed_text}</td>
                  <td>
                    {contribution.image_url ? (
                      <img
                        src={contribution.image_url}
                        alt="Contribution"
                        style={{ width: "50px", height: "50px", cursor: "pointer" }}
                        onClick={() => setShowImageModal(true)}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "space-around", gap: '10px' }}>
                      {/* Edit Button */}
                      <button
                        style={{
                          padding: '8px',
                          backgroundColor: '#2196F3',  
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          height: '32px',
                          width: '32px',  
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                        onClick={() => handleEditModal(contribution)}
                        disabled={actionLoading}
                      >
                       <i
        style={{
          height: '1rem',
          width: '1rem',
          display: 'flex', // Ensure the icon itself is treated as a flex container
          justifyContent: 'center',
          alignItems: 'center'
        }}
        className="material-symbols-outlined icon"
      >
        edit
      </i>
                      </button>

                      {/* Approve Button */}
                      <button
                        style={{
                          padding: '8px',
                          backgroundColor: '#4CAF50',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          height: '32px',
                          width: '32px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                        onClick={() => handleApprove(contribution)} // Show confirmation modal instead
                        disabled={actionLoading}
                      >
                      <i
        style={{
          height: '1rem',
          width: '1rem',
          display: 'flex', // Ensure the icon itself is treated as a flex container
          justifyContent: 'center',
          alignItems: 'center'
        }}
        className="material-symbols-outlined icon"
      >
        check_circle
      </i>
                      </button>

                      {/* Delete Button */}
                      <button
                        style={{
                          padding: '8px',
                          backgroundColor: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          height: '32px',
                          width: '32px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                        onClick={() => handleReject(contribution)}
                        disabled={actionLoading}
                      >
                     <i
        style={{
          height: '1rem',
          width: '1rem',
          display: 'flex', // Ensure the icon itself is treated as a flex container
          justifyContent: 'center',
          alignItems: 'center'
        }}
        className="material-symbols-outlined icon"
      >
        delete
      </i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No unapproved contributions available.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Approve Confirmation Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Approval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to approve this contribution?</p>
          <p><strong>{selectedContribution?.description}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmApprove} disabled={actionLoading}>
            {actionLoading ? <Spinner animation="border" size="sm" /> : 'Approve'}
          </Button>
        </Modal.Footer>
      </Modal>

{/* Edit Contribution Modal */}
<Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit Contribution</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      {/* Description Field */}
      <Form.Group className="mb-3" controlId="formDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control 
          type="text" 
          name="description" 
          value={editedContribution.description} 
          onChange={handleEditChange} 
          placeholder="Enter description"
        />
      </Form.Group>

      {/* Input Field */}
      <Form.Group className="mb-3" controlId="formInputMain">
        <Form.Label>Input</Form.Label>
        <Form.Control 
          type="text" 
          name="input_main" 
          value={editedContribution.input_main} 
          onChange={handleEditChange} 
          placeholder="Enter input"
        />
      </Form.Group>

      {/* Output Field */}
      <Form.Group className="mb-3" controlId="formOutputMain">
        <Form.Label>Output</Form.Label>
        <Form.Control 
          type="text" 
          name="output_main" 
          value={editedContribution.output_main} 
          onChange={handleEditChange} 
          placeholder="Enter output"
        />
      </Form.Group>

      {/* Contributed Text Field */}
      <Form.Group className="mb-3" controlId="formContributedText">
        <Form.Label>Contributed Text</Form.Label>
        <Form.Control 
          type="text" 
          name="contributed_text" 
          value={editedContribution.contributed_text} 
          onChange={handleEditChange} 
          placeholder="Enter contributed text"
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleEditSave} disabled={actionLoading}>
      {actionLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
    </Button>
  </Modal.Footer>
</Modal>


      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this contribution?</p>
          <p><strong>{selectedContribution?.description}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={actionLoading}>
            {actionLoading ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contribution Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContribution?.image_url ? (
            <img src={selectedContribution.image_url} alt="Contribution" style={{ width: '100%' }} />
          ) : (
            <p>No image available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Contribution;
