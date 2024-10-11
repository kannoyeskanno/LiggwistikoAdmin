import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, update, remove } from 'firebase/database';
import { Modal, Button, Spinner } from 'react-bootstrap';
import './Lib.css';

const Lib = ({ email, paths, language, unapprovedCount }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [updatedTagalog, setUpdatedTagalog] = useState('');
  const [updatedBikol, setUpdatedBikol] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const db = getDatabase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let dbRefPath;

        if (language === 'Daraga') {
          dbRefPath = '/13HwVWGPaI6OvUNZNjDvmekhIvGTOGv-3RBDElfGrr4o/Daraga';
        } else if (language === 'Cam Norte') {
          dbRefPath = '/13HwVWGPaI6OvUNZNjDvmekhIvGTOGv-3RBDElfGrr4o/Cam Norte';
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

  useEffect(() => {
    if (data) {
      setLoadingSearch(true);
      const timeoutId = setTimeout(() => {
        const filtered = Object.keys(data).filter(key => {
          const item = data[key];
          const tagalogText = typeof item.Tagalog === 'string' ? item.Tagalog.toLowerCase() : '';
          const bikolText = typeof item.Bikol === 'string' ? item.Bikol.toLowerCase() : '';
          return (
            tagalogText.includes(searchTerm.toLowerCase()) ||
            bikolText.includes(searchTerm.toLowerCase())
          );
        });
        setFilteredData(filtered);
        setLoadingSearch(false);
      }, 300); 

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, data]);

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
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={`Search Filipino or ${
            language === 'Daraga' ? 'Daraga (East Miraya)' : language === 'Cam Norte' ? 'Cam Norte (Coastal)' : language
          }...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 40px 10px 40px', 
            width: '100%',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <span
          className="search-icon" 
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#888',
            pointerEvents: 'none',
          }}
        >
          <i className="material-symbols-outlined search-icon">search</i>
        </span>
      </div>

      {loadingSearch && <Spinner animation="border" style={{ marginBottom: '20px' }} />}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', background: 'rgba(85, 75, 205, 0.6)', color: '#ffff' }}>Filipino</th>
            <th style={{padding: '8px', background: 'rgba(85, 75, 205, 0.6)', color: '#ffff'  }}>{language}</th>
            <th style={{padding: '8px', background: 'rgba(85, 75, 205, 0.6)', color: '#ffff'  }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((key) => (
              <tr key={key}>
              <td style={{ border: '.1px solid rgba(85, 75, 205, 0.1)', padding: '8px' }}>
                {data[key].Tagalog}
              </td>
              <td style={{ border: '.1px solid rgba(85, 75, 205, 0.1)', padding: '8px'}}>
                {data[key].Bikol}
              </td>
              <td style={{ border: '.1px solid rgba(85, 75, 205, 0.15)', padding: '8px', textAlign: 'center' }}>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
    {/* <button
      style={{
        padding: '8px',
        backgroundColor: '#3f51b5',
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
      onClick={() => handleShow('edit', { key, ...data[key] })}
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
    </button> */}
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
      onClick={() => handleShow('delete', { key, ...data[key] })}
    >
      <i
        style={{
          height: '1rem',
          width: '1rem',
          display: 'flex', 
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
              <td colSpan="3" style={{ textAlign: 'center', padding: '16px' }}>
                No matching data found for "{searchTerm}".
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

      <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === 'delete' ? 'Delete Confirmation' : 'Edit Entry'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalAction === 'delete' ? (
            <>
              <p>Are you sure you want to delete the entry?</p>
              <strong>Tagalog:</strong> {currentItem?.Tagalog} <br />
              <strong>Bikol:</strong> {currentItem?.Bikol}
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Tagalog:</label>
                <input
                  type="text"
                  value={updatedTagalog}
                  onChange={(e) => setUpdatedTagalog(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Bikol:</label>
                <input
                  type="text"
                  value={updatedBikol}
                  onChange={(e) => setUpdatedBikol(e.target.value)}
                  className="form-control"
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {modalAction === 'delete' ? (
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Body>
          <p>{successMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Lib;
