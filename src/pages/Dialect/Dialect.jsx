import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, getMetadata } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";
import './Dialect.css';
import { app } from '../../firebase'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const Dialect = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: '', type: '' });
  const [selectedDialect, setSelectedDialect] = useState('');
  const [progress, setProgress] = useState(0);
  const storage = getStorage(app);
  const database = getDatabase(app);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleUpload = () => {
    if (!file || !selectedDialect) {
      alert("Please select a file and a dialect first.");
      return;
    }

    const storageRef = ref(storage, `xlsx/${selectedDialect.toUpperCase()}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setLoading(true);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progressValue = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressValue);
      },
      (error) => {
        setLoading(false);
        setAlert({ visible: true, message: 'Upload failed!', type: 'danger' });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setLoading(false);
          setProgress(0);
          setAlert({ visible: true, message: 'File uploaded successfully!', type: 'success' });

          const updateRef = dbRef(database, `updates/${selectedDialect.toUpperCase()}`);
          const timestamp = new Date().toISOString();
          set(updateRef, {
            downloadURL,
            timestamp,
            fileName: file.name,
          });
        });
      }
    );
  };



  const handleDialectSelect = (dialect) => setSelectedDialect(dialect);

  return (
    <div className="admin-dashboard">
      <aside className="sidebar-dialect">
        <h2>Dialects</h2>
        <ul className="list-group">
          {['Daraga', 'Cam Norte', 'English', 'Filipino'].map(dialect => (
            <li key={dialect}
                className={`list-group-item ${selectedDialect === dialect ? 'active' : ''}`}
                onClick={() => handleDialectSelect(dialect)}>
              {dialect}
            </li>
          ))}
        </ul>
      </aside>

      <main className="content">
        <header>
          <h1>Manage Dialect Files</h1>
          {alert.visible && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
              {alert.message}
              <button type="button" className="close" onClick={() => setAlert({ ...alert, visible: false })}>
                &times;
              </button>
            </div>
          )}
        </header>

        <div className="upload-section card shadow-sm p-4">
          <div
            className="drag-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p>Drag and drop an XLSX file here, or click to select</p>
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
          </div>

          {file && (
            <div className="file-info">
              <p><strong>Selected File:</strong> {file.name}</p>
              <p><strong>Selected Dialect:</strong> {selectedDialect || 'None'}</p>
            </div>
          )}

          {loading && (
            <div className="progress mt-3" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar" style={{ width: `${progress}%` }}>
                {Math.round(progress)}%
              </div>
            </div>
          )}
<button 
  className={`btn ${loading || !file || !selectedDialect ? 'btn-secondary' : 'btn-primary'} mt-3`} 
  onClick={handleUpload} 
  disabled={loading || !file || !selectedDialect}
>
  {loading ? (
    <span>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Uploading...
    </span>
  ) : 'Upload File'}
</button>
        </div>
      </main>
    </div>
  );
};

export default Dialect;
