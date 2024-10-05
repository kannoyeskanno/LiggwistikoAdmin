import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Row, Col, Container } from 'react-bootstrap';
import Loading from './LoadingCard/LoadingCard'; // Import the Loading component
import SWL from "../../images/arfis-logo.png";
import { auth } from '../../firebase'; 
import { useNavigate } from 'react-router-dom'; // For redirection
import { collection, getDocs, query, where } from 'firebase/firestore'; // Import Firestore methods
import { db } from '../../firebase'; // Ensure you import your Firebase Firestore instance

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [unapprovedCounts, setUnapprovedCounts] = useState({}); // State for storing unapproved counts
  const navigate = useNavigate(); 

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
      },
      (error) => {
        console.error("Error fetching auth state: ", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const profiles = [
    {
      email: 'jomarasisgriffin@gmail.com',
      name: 'Asis Jomar R.',
      location: 'Daraga (East Miraya)',
      role: 'Validator',
      image: SWL,
      language: 'Daraga',
      canAccessLibrary: true,
      translationPaths: ['Filipino-Daraga', 'Daraga-Filipino'], // Array for contributions
    },
    {
      email: 'kannokanno914@gmail.com',
      name: 'Kanno Kanno',
      location: 'Camarines Norte (Coastal Bikol)',
      role: 'Validator',
      image: SWL,
      language: 'Cam Norte',
      canAccessLibrary: false,
      translationPaths: ['CamNorte-Filipino', 'Filipino-CamNorte'], // Array for contributions
    },
  ];

  // Updated handleDatasetAccess to accept language
  const handleDatasetAccess = (email, paths, count, language) => { 
    navigate(`/library/${encodeURIComponent(email)}?paths=${encodeURIComponent(JSON.stringify(paths))}&unapprovedCounts=${encodeURIComponent(JSON.stringify({ [email]: count }))}&language=${encodeURIComponent(language)}`); 
  };

  useEffect(() => {
    const fetchUnapprovedCounts = async () => {
      const counts = {};
      
      await Promise.all(profiles.map(async (profile) => {
        let totalUnapproved = 0; // Initialize total count for the profile

        // Loop through each translation path
        await Promise.all(profile.translationPaths.map(async (path) => {
          const q = query(
            collection(db, `translations/${path}/contributions`), // Query the contributions for each path
            where("approved", "==", false) // Filter for unapproved contributions
          );

          const querySnapshot = await getDocs(q);
          totalUnapproved += querySnapshot.size; // Add to total unapproved count
        }));

        counts[profile.email] = totalUnapproved; // Store the total count for the profile
      }));

      setUnapprovedCounts(counts); // Update state with counts
    };

    fetchUnapprovedCounts();
  }, [profiles]); // Run this effect only once after the component mounts

  return (
    <Container className="dashboard-container text-center">
      <Row className="justify-content-center mt-4">
        {loading ? (
          <Loading /> 
        ) : (
          profiles.map((profile, index) => (
            <Col key={index} md={4} className="mb-4 d-flex justify-content-center">
              <Card className="profile-card">
                <Card.Body className="d-flex align-items-center">
                  <div className="image-profile me-3">
                    <img src={profile.image} alt="profile" className="profile-image" />
                  </div>
                  <div className="text-details text-start">
                    <h3 className="name">{profile.name}</h3>
                    <p className="role mb-1">{profile.role}</p>
                    <p className="location">{profile.location}</p>
                    <p className="unapproved-count">
                      Unapproved Contributions: {unapprovedCounts[profile.email] || 0} {/* Display count */}
                    </p>
                  </div>
                </Card.Body>
                <Button 
                  variant="primary" 
                  className="w-100" 
                  disabled={!user || user.email !== profile.email || !profile.canAccessLibrary} 
                  // Pass the language as a parameter
                  onClick={() => handleDatasetAccess(profile.email, profile.translationPaths, unapprovedCounts[profile.email] || 0, profile.language)} 
                >
                  {profile.canAccessLibrary ? 'Access Library' : 'Access Denied'}
                </Button>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;
