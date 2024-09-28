import React, { useState, useEffect } from 'react';
import './Settings.css';
import { auth } from '../../firebase'; // Import auth to get the user info
import { getDatabase, ref, get, set } from 'firebase/database'; // Import Realtime Database

export default function Settings() {
  const [frequency, setFrequency] = useState('immediate');
  const [notifyApproval, setNotifyApproval] = useState(false);
  const [notifyRejection, setNotifyRejection] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for fetching data

  useEffect(() => {
    // Fetch existing settings from Firebase if available
    const fetchSettings = async () => {
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const userSettingsRef = ref(db, 'users/' + user.uid + '/settings');
        
        try {
          const snapshot = await get(userSettingsRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Prepopulate settings from database
            setFrequency(data.notificationSettings.frequency || 'immediate');
            setNotifyApproval(data.notificationSettings.notifyApproval || false);
            setNotifyRejection(data.notificationSettings.notifyRejection || false);
            setNotifyStatus(data.notificationSettings.notifyStatus || false);
          }
        } catch (error) {
          console.error("Error fetching settings: ", error);
        } finally {
          setLoading(false); // Stop loading when the data is fetched
        }
      } else {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the current user
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase(); // Get the Realtime Database instance
      const userSettingsRef = ref(db, 'users/' + user.uid + '/settings'); // Set path for storing user settings

      // Save settings to Realtime Database
      set(userSettingsRef, {
        email: user.email, // Save user email
        notificationSettings: {
          frequency,
          notifyApproval,
          notifyRejection,
          notifyStatus,
        },
      })
        .then(() => {
          alert('Settings saved successfully!');
        })
        .catch((error) => {
          console.error('Error saving settings: ', error);
        });
    } else {
      alert('No user is signed in');
    }
  };

  if (loading) {
    return (
      <div className="spinner center">
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
      </div>
    ); // Show spinner while loading
  }

  return (
    <div className="settings-container">
      <div className="main-content">
        <h2>Document Check Notification Settings</h2>
        <form className="notification-form" onSubmit={handleSubmit}>
          <label>
            Frequency of Notifications:
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="immediate">Immediately</option>
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
              <option value="never">Never</option>
            </select>
          </label>
          <div className="notification-options">
            <label>
              <input
                type="checkbox"
                checked={notifyApproval}
                onChange={(e) => setNotifyApproval(e.target.checked)}
              />
              Notify me for document approvals
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifyRejection}
                onChange={(e) => setNotifyRejection(e.target.checked)}
              />
              Notify me for document rejections
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifyStatus}
                onChange={(e) => setNotifyStatus(e.target.checked)}
              />
              Notify me for status updates
            </label>
          </div>
          <button type="submit">Save Settings</button>
        </form>
      </div>
    </div>
  );
}
