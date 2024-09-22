import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust the path to your firebase config
import "./Comments.css";
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Tooltip from 'react-bootstrap/Tooltip';



const languagePairs = [
  "Cam Norte-Filipino",
  "Cam Norte-English",
  "Cam Norte-Daraga",
  "Daraga-English",
  "Daraga-Filipino",
  "Daraga-Cam Norte",
  "English-Filipino",
  "English-Daraga",
  "English-Cam Norte",
  "Filipino-Daraga",
  "Filipino-English",
  "Filipino-Cam Norte",
];

const Comments = () => {
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    const fetchAllContributions = async () => {
      const statusUpdates = {};
    
      for (const pair of languagePairs) {
        try {
          const contributionsRef = collection(
            db,
            "reports",
            pair,
            "contributions"
          );
          const contributionsSnapshot = await getDocs(contributionsRef);
    
          if (!contributionsSnapshot.empty) {
            for (const contributionDoc of contributionsSnapshot.docs) {
              const contributionId = contributionDoc.id;
              const documentId = pair;
    
              try {
                const translationRef = doc(
                  db,
                  "translations",
                  documentId,
                  "contributions",
                  contributionId
                );
                const translationSnap = await getDoc(translationRef);
    
                if (translationSnap.exists()) {
                  // Fetch the "reason" field
                  const reason = contributionDoc.data().reason || "No reason provided";
    
                  statusUpdates[`${pair} - ${contributionId}`] = {
                    status: "Translation fetched",
                    documentId,
                    contributionId,
                    reason,  // Add the reason field
                    data: translationSnap.data(),
                  };
                } else {
                  statusUpdates[`${pair} - ${contributionId}`] = {
                    status: "No translation found",
                    documentId,
                    contributionId,
                  };
                }
              } catch (error) {
                statusUpdates[`${pair} - ${contributionId}`] = {
                  status: `Error fetching translation: ${error.message}`,
                  documentId,
                  contributionId,
                };
              }
            }
          } else {
            statusUpdates[pair] = { status: "No contribution data found" };
          }
        } catch (error) {
          statusUpdates[pair] = {
            status: `Error fetching data: ${error.message}`,
          };
        }
      }
    
      setStatuses(statusUpdates);
      setLoading(false);
    };
    

    fetchAllContributions();
  }, []);


  const [showPopover, setShowPopover] = useState(false);

  const handleToggle = () => {
    setShowPopover(!showPopover);
  };

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">More options</Popover.Header>
      <Popover.Body>
      </Popover.Body>
    </Popover>
  );

  const reasonIcons = {
    Abuse: "block",       
    Fake: "warning",      
    Spam: "delete",       
    Harassment: "gavel",  
    Other: "help_outline", 
  };
  

  const fetchComments = async (documentId, contributionId) => {
    setLoadingComments(true);
    const commentsRef = collection(
      db,
      "translations",
      documentId,
      "contributions",
      contributionId,
      "comments"
    );
    const commentsSnapshot = await getDocs(commentsRef);

    const commentsData = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setComments(commentsData);
    setLoadingComments(false);
  };

  const handleCardClick = (key) => {
    setSelectedContribution(statuses[key]);
    const { documentId, contributionId } = statuses[key];
    fetchComments(documentId, contributionId); 
  };

  return (
    <div className="comment-container">
      <div className="top-container">
        <h1>Contributions Status</h1>
      </div>
      <div className="content-container">
        <div className="left-section">
          <h2>Contribution Details</h2>
          {selectedContribution ? (
            <div className="container-card">
              <div className="contribution-card">
                <div className="contribution-upper">
                  <div className="profile-section">
                    <i className="material-symbols-outlined profile-icon">person</i>

                    <div className="user-details">
                      <p className="email-text">{selectedContribution.data.user_email}</p>
                      <p className="timestamp">
                        {new Date(selectedContribution.data.timestamp.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="status-section">
                    <i
                      className={`material-symbols-outlined profile-icon ${selectedContribution.data.verified ? "verified" : "not-verified"}`}
                    >
                      verified
                    </i>
                    <i
                      className={`material-symbols-outlined profile-icon ${selectedContribution.data.approved ? "approved" : "not-approved"}`}
                    >
                      recommend
                    </i>
                    <OverlayTrigger
      trigger="click"
      placement="top"
      overlay={popover}
      show={showPopover}
      onToggle={handleToggle}
    >
      <i className="material-symbols-outlined profile-icon" onClick={handleToggle}>more_horiz</i>
    </OverlayTrigger>
                    <i className="material-symbols-outlined profile-icon">more_horiz</i>
                  </div>
                </div>

                <div className="contribution-body">
                  <p>
                    <strong>Contributed Text:</strong>{" "}
                    {selectedContribution.data.contributed_text}
                  </p>
                  <p>
                    <strong>Output Main:</strong>{" "}
                    {selectedContribution.data.output_main}
                  </p>
                  <p>
                    <strong>Input Main:</strong>{" "}
                    {selectedContribution.data.input_main}
                  </p>
                  {selectedContribution.data.image_url && (
                    <div className="image-container">
                      <img src={selectedContribution.data.image_url} alt="Contribution" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>Select a contribution to see details.</p>
          )}

          <h2>Comments</h2>
          {loadingComments ? (
            <p>Loading comments...</p>
          ) : (
            <div className="comments-container">
              {comments.map((comment) => (
                <div className="comment-card" key={comment.comment_id}>
                  <p>
                    <strong>User:</strong> {comment.user_email}
                  </p>
                  <p>
                    <strong>Comment:</strong> {comment.comment}
                  </p>
                  <p>
                    <strong>Contributed Text:</strong>{" "}
                    {comment.contributed_text}
                  </p>
                  <p>
                    <strong>Rating:</strong> {comment.rating}
                  </p>
                  <p>
                    <strong>Document ID:</strong> {comment.document_id}
                  </p>
                  <p>
                    <strong>Contribution ID:</strong> {comment.contribution_id}
                  </p>
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
              {comments.length === 0 && <p>No comments available.</p>}
            </div>
          )}
        </div>

        <div className="right-section">
          {loading ? (
            <div className="shimmer-container shimmer"></div>
          ) : (
            <ul className="list-group">
              {Object.keys(statuses).map((key) => {
                const { documentId, contributionId, status, data } =
                  statuses[key];

                if (status === "No contribution data found") {
                  return null;
                }

                return (
                  <li className="list-group-item" key={key} onClick={() => handleCardClick(key)}>
                    <div className="upper-card">
                      <div className="profile-container">
                        <i className="material-symbols-outlined profile-icon">person</i>
                      </div>
                  
                      <div className="details">
                        <p className="email-text">{data.user_email}</p>
                        <p className="timestamp">
                          {new Date(data.timestamp.seconds * 1000).toLocaleString()}
                        </p>
                      </div>
                  
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip id={`tooltip-${key}`}>
                            {statuses[key].reason || "Report"}
                          </Tooltip>
                        }
                      >
                        <i className="material-symbols-outlined report-icon">
                          {reasonIcons[statuses[key].reason] || "report"}
                        </i>
                      </OverlayTrigger>
                    </div>
                  
                    <div className="lower-card">
                      <p>Correction Submitted: <strong>{data.contributed_text}</strong></p>
                      <p>Translated output: <strong>{data.output_main}</strong></p>
                      <p>Input: <strong>{data.input_main}</strong></p>
                      <p><strong>Reason:</strong> {statuses[key].reason}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
