import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserCount = () => {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get('/user-count'); // Your backend endpoint
        setUserCount(response.data.userCount);
      } catch (err) {
        setError('Error fetching user count');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Total Users: {userCount}</div>;
};

export default UserCount;
