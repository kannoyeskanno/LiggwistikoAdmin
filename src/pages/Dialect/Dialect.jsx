import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";
import './Dialect.css';
import { app } from '../../firebase'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const Dialect = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: '', type: '' });
  const [selectedDialect, setSelectedDialect] = useState('Daraga');
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
      setAlert({ visible: true, message: 'Please select a file and a dialect first.', type: 'danger' });
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
    <div className="container my-5">
      <div className="layout">
        {/* Left side: Navigation and card */}
        <div className="left-side">
          <ul className="nav nav-tabs flex-row">
            {['Daraga', 'Cam Norte'].map(dialect => (
              <li className="nav-item" key={dialect}>
                <a
                  className={`nav-link ${selectedDialect === dialect ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDialectSelect(dialect);
                  }}
                >
                  {dialect}
                </a>
              </li>
            ))}
          </ul>

          {/* Details card */}
          <div className="card mt-4">
            <img src="https://via.placeholder.com/150" className="card-img-top" alt="Dialect" />
            <div className="card-body">
              <p className="card-text">
                {`Details about the ${selectedDialect} dialect.`}
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Breadcrumbs and drag/drop */}
        <div className="right-side">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">{`/update/${selectedDialect}`}</li>
            </ol>
          </nav>

          {/* Drag and drop area */}
          <div
            className="drag-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p>Drag and drop an XLSX file here, or <strong>click to select</strong></p>
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
          </div>

          {/* File and Dialect Information */}
          {file && (
            <div className="file-info mt-3">
              <p><strong>Selected File:</strong> {file.name}</p>
              <p><strong>Selected Dialect:</strong> {selectedDialect}</p>
            </div>
          )}

          {/* Upload Progress */}
          {loading && (
            <div className="progress mt-3" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar" style={{ width: `${progress}%` }}>
                {Math.round(progress)}%
              </div>
            </div>
          )}

          {/* Upload Button */}
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
      </div>
    </div>
  );
};

export default Dialect;
