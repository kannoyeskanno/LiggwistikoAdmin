import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, update, remove } from 'firebase/database'; 
import { Modal, Button, Spinner } from 'react-bootstrap'; 
import './Lib.css'; 

const Lib = ({ email, paths, language, unapprovedCount }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false); // New loading state for search
  const [showModal, setShowModal] = useState(false); 
  const [modalAction, setModalAction] = useState(''); 
  const [currentItem, setCurrentItem] = useState(null); 
  const [updatedTagalog, setUpdatedTagalog] = useState(''); 
  const [updatedBikol, setUpdatedBikol] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [filteredData, setFilteredData] = useState([]); // State for filtered data

  const db = getDatabase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let dbRefPath;

        if (language === 'Daraga') {
          dbRefPath = '/13HwVWGPaI6OvUNZNjDvmekhIvGTOGv-3RBDElfGrr4o/Daraga'; 
        } else if (language === 'Cam Norte') {
          dbRefPath = '/path/to/cam/norte'; 
        }

        if (dbRefPath) {
          const dbRef = ref(db, dbRefPath);
          const snapshot = await get(dbRef);
          if (snapshot.exists()) {
            setData(snapshot.val());
          } else {
            console.log("No data available");
          }
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [db, language]);

  // Update filtered data based on search term
  useEffect(() => {
    if (data) {
      setLoadingSearch(true); // Set loading state for search
      const timeoutId = setTimeout(() => {
        const filtered = Object.keys(data).filter(key => {
          const item = data[key];
          return (
            item.Tagalog.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Bikol.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        setFilteredData(filtered);
        setLoadingSearch(false); // Reset loading state for search
      }, 300); // Delay for search (300ms)

      return () => clearTimeout(timeoutId); // Cleanup timeout
    }
  }, [searchTerm, data]); // Trigger when searchTerm or data changes

  // Modal open/close handlers
  const handleClose = () => {
    setShowModal(false);
    setCurrentItem(null);
    setModalAction('');
    setUpdatedTagalog('');
    setUpdatedBikol('');
  };

  const handleShow = (action, item) => {
    setModalAction(action); 
    setCurrentItem(item); 
    if (action === 'edit') {
      setUpdatedTagalog(item?.Tagalog); 
      setUpdatedBikol(item?.Bikol); 
    }
    setShowModal(true); 
  };

  const handleDelete = async () => {
    const dbRefPath = `/13HwVWGPaI6OvUNZNjDvmekhIvGTOGv-3RBDElfGrr4o/Daraga/${currentItem.key}`;
    
    try {
      await remove(ref(db, dbRefPath)); 
      setData((prevData) => {
        const updatedData = { ...prevData };
        delete updatedData[currentItem.key]; 
        return updatedData;
      });
      setSuccessMessage('Delete successful!'); 
      setShowSuccessModal(true); 
      handleClose(); 
    } catch (error) {
      console.error('Error deleting data: ', error);
    }
  };

  const handleSaveChanges = async () => {
    if (modalAction === 'edit' && currentItem) {
      const dbRefPath = `/13HwVWGPaI6OvUNZNjDvmekhIvGTOGv-3RBDElfGrr4o/Daraga/${currentItem.key}`;

      const updates = {
        Tagalog: updatedTagalog,
        Bikol: updatedBikol,
      };

      try {
        await update(ref(db, dbRefPath), updates); 
        setData((prevData) => ({
          ...prevData,
          [currentItem.key]: { ...prevData[currentItem.key], ...updates },
        }));
        setSuccessMessage('Edit successful!'); 
        setShowSuccessModal(true); 
        handleClose(); 
      } catch (error) {
        console.error('Error updating data: ', error);
      }
    }
  };

  if (loading) {
    return (
      <div>
        <h1>This is Library</h1>
        <h2>User Email: {decodeURIComponent(email)}</h2>
        <h3>Language: {language}</h3>
        <h4>Unapproved Contributions: {unapprovedCount}</h4>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h1>This is Library</h1>
      <h2>User Email: {decodeURIComponent(email)}</h2>
      <h3>Language: {language}</h3>
      <h4>Unapproved Contributions: {unapprovedCount}</h4>
      
      <input
        type="text"
        placeholder="Search Tagalog or Bikol..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
        style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          width: '100%', 
          borderRadius: '4px', 
          border: '1px solid #ccc'
        }}
      />

      {loadingSearch && <Spinner animation="border" style={{ marginBottom: '20px' }} />}

      <div>
        <h3>Data for {language}</h3>
        {filteredData.length > 0 ? (
          filteredData.map((key) => (
            <div key={key} style={{
              borderTop: '2px solid #3f51b5', 
              borderBottom: '2px solid #3f51b5', 
              padding: '16px',
              margin: '8px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <strong>{key}</strong>
                <p>Tagalog: {data[key].Tagalog}</p>
                <p>Bikol: {data[key].Bikol}</p>
              </div>
              <div>
                <button
                  style={{
                    marginRight: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#3f51b5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleShow('edit', { key, ...data[key] })} // Open modal for edit
                >
                  Edit
                </button>
                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleShow('delete', { key, ...data[key] })} // Open modal for delete
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No matching data found for "{searchTerm}".</p>
        )}
      </div>

      <h3>Translation Paths</h3>
      <ul>
        {paths && paths.length > 0 ? (
          paths.map((path, index) => (
            <li key={index}>{path}</li>
          ))
        ) : (
          <li>No translation paths available.</li>
        )}
      </ul>

      {/* Main Modal Structure */}
      <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === 'delete' ? 'Delete Confirmation' : 'Edit Entry'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalAction === 'delete' ? (
            <p>Are you sure you want to delete <strong>{currentItem?.key}</strong>?</p>
          ) : (
            <div>
              <p><strong>{currentItem?.key}</strong></p>
              <div>
                <label>Tagalog:</label>
                <input
                  type="text"
                  value={updatedTagalog}
                  onChange={(e) => setUpdatedTagalog(e.target.value)} 
                />
              </div>
              <div>
                <label>Bikol:</label>
                <input
                  type="text"
                  value={updatedBikol}
                  onChange={(e) => setUpdatedBikol(e.target.value)} // Update Bikol input
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          {modalAction === 'delete' ? (
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          ) : (
            <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Success Modal for confirmation */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>{successMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Lib;
