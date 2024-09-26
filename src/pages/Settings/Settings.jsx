import React, { useState, useEffect } from 'react';
import './Settings.css';
import { auth } from '../../firebase'; 
import { getDatabase, ref, get, set } from 'firebase/database'; 

export default function Settings() {
  const [frequency, setFrequency] = useState('immediate');
  const [notifyApproval, setNotifyApproval] = useState(false);
  const [notifyRejection, setNotifyRejection] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchSettings = async () => {
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const userSettingsRef = ref(db, 'users/' + user.uid + '/settings');
        
        try {
          const snapshot = await get(userSettingsRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setFrequency(data.notificationSettings.frequency || 'immediate');
            setNotifyApproval(data.notificationSettings.notifyApproval || false);
            setNotifyRejection(data.notificationSettings.notifyRejection || false);
            setNotifyStatus(data.notificationSettings.notifyStatus || false);
          }
        } catch (error) {
          console.error("Error fetching settings: ", error);
        } finally {
          setLoading(false); 
        }
      } else {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (user) {
      const db = getDatabase(); 
      const userSettingsRef = ref(db, 'users/' + user.uid + '/settings'); 

      set(userSettingsRef, {
        email: user.email, 
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
    return <div>Loading...</div>; 
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
