import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap styles are included
import './Analytics.module.scss'; // Import SCSS for custom styling
import { auth } from '../../firebase'; // Adjust the path to your Firebase config
import { getDatabase, ref, get } from 'firebase/database';

const Analytics = () => {
  const [updateData, setUpdateData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userEmail = user.email.replace(/\./g, "_"); // Replace '.' with '_'
          const dbRealtime = getDatabase();

          // Reference to the approved contributions
          const dataRef = ref(dbRealtime, `adminUpdateCollection/${userEmail}/approvedContributions`);

          const snapshot = await get(dataRef);
          if (snapshot.exists()) {
            const contributions = snapshot.val();
            const contributionIds = Object.keys(contributions); // Get all IDs

            // Filter for contributions with status of ""
            const contributionsWithEmptyStatus = contributionIds
              .filter(id => contributions[id].status === "") // Filter IDs by status
              .map(id => ({ id, data: contributions[id] })); // Map to get IDs and their data

            setUpdateData(contributionsWithEmptyStatus); // Set the contributions data
          } else {
            console.log("No approved contributions available for this user.");
            setUpdateData([]); // Set to an empty array if no contributions are found
          }
        }
      } catch (error) {
        console.error('Error fetching approved contributions:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchData();
  }, []);

  return (
    <div className="analytics-container">
      {loading && <p>Loading...</p>}
      {updateData.length > 0 ? ( // Check if there's any data
        updateData.map(({ id }) => (
          <div key={id}>
            {/* Display each approved contribution ID with empty status */}
            <h5>ID: {id}</h5>
          </div>
        ))
      ) : (
        <p>No approved contributions with an empty status available.</p>
      )}
    </div>
  );
};

export default Analytics;
