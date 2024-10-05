import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";
import './Dialect.scss';
import { app } from '../../firebase'; 
import 'bootstrap/dist/css/bootstrap.min.css';

import "../../images/arfis-logo.png";

const Dialect = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: '', type: '' });
  const [selectedDialect, setSelectedDialect] = useState('Daraga');
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
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

    const imageURL = getDialectImage(selectedDialect);
    console.log(imageURL);

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

          setTimeout(() => {
            setAlert({ visible: false, message: '', type: '' });
          }, 5000);
        });
      }
    );
  };

  const handleDialectSelect = (dialect) => {
    setFadeIn(false);

    setTimeout(() => {
      setSelectedDialect(dialect);
      setFadeIn(true);
    }, 500); 
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getDialectDetails = () => {
    if (selectedDialect === 'Daraga') {
      return `East Miraya Bikol, also known as Bikol Miraya, is a dialect of the Bikol language spoken primarily in the eastern part of Albay province, specifically in the towns of Daraga, Legazpi, and neighboring areas.`;
    } else {
      return `The Camarines Norte dialect is spoken in the northern part of the Bicol region. This dialect has notable differences in pronunciation and vocabulary compared to other Bicol languages.`;
    }
  };

  const getDialectImage = (selectedDialect) => {
    if (selectedDialect === 'Daraga') {
      return "arfis-logo.png";  
    } else if (selectedDialect === 'Cam Norte') {
      return "https://example.com/cam-norte-image.jpg"; 
    }
    return "https://via.placeholder.com/150";  
  };
  
  return (
    <div className="container">
      <div className="top-side">
        {alert.visible && (
          <div className={`alert alert-${alert.type} show`} role="alert">
            {alert.message}
          </div>
        )}

       
      </div>
      <div className="layout">
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

          <div className="card mt-4">
            <img src={getDialectImage(selectedDialect)} className="card-img-top" alt={selectedDialect} />
            <div className="card-body">
              <p className={`card-text fade ${fadeIn ? 'active' : ''}`}>
                {getDialectDetails()}
              </p>
            </div>
          </div>
        </div>

        <div className="right-side">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">{`/ update / ${selectedDialect}`}</li>
            </ol>
          </nav>

          <div
            className="drag-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p>Drag and drop an XLSX file here, or <strong>click to select</strong></p>
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
          </div>

          {file && (
            <div className="file-info mt-3">
              <p><strong>Selected File:</strong> {file.name}</p>
              <p><strong>Selected Dialect:</strong> {selectedDialect}</p>
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
      </div>
    </div>
  );
};

export default Dialect;