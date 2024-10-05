import React from 'react';

const Contribution = ({ email, paths, language, unapprovedCount }) => {
  return (
    <div>
      <h1>This is Contribution</h1>
      <h2>User Email: {decodeURIComponent(email)}</h2>
      <h3>Language: {language}</h3> {/* Display the language */}
      <h4>Unapproved Contributions: {unapprovedCount}</h4> {/* Display unapproved count */}
      <h3>Translation Paths</h3>
      <ul>
        {paths && paths.length > 0 ? (
          paths.map((path, index) => (
            <li key={index}>{path}</li>
          ))
        ) : (
          <li>No translation paths available.</li>
        )}
      </ul>
    </div>
  );
};

export default Contribution;
