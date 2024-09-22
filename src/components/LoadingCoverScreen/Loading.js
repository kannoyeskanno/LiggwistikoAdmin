import React from 'react';
import './Loading.css'; 

const Loading = () => {
  return (
    <div className="loading-container">
      <section className="dots-container">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </section>
    </div>
  );
};

export default Loading;
