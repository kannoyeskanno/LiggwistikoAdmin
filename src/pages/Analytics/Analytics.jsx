import React from 'react';
import './Analytics.css';

const Analytics = () => {
  const userCount = 150;
  const contributionCount = 75;
  const activeUsers = 120;
  const newUsers = 30;

  return (
    <div className="analytics-container">
      <div className="top-container">
        <h1>Analytics</h1>
      </div>
      <div className="metrics-container">
        <div className="metric">
          <h2>User Count</h2>
          <p>{userCount}</p>
        </div>
        <div className="metric">
          <h2>Contribution Count</h2>
          <p>{contributionCount}</p>
        </div>
        <div className="metric">
          <h2>Active Users</h2>
          <p>{activeUsers}</p>
        </div>
        <div className="metric">
          <h2>New Users</h2>
          <p>{newUsers}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;