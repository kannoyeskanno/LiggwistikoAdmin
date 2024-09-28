import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Toast from "react-bootstrap/Toast";

import "./Comments.css";
import { Popover, OverlayTrigger } from "react-bootstrap";
import Tooltip from "react-bootstrap/Tooltip";
import Card from "react-bootstrap/Card"; 

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
  const [showPopover, setShowPopover] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
                  const reason =
                    contributionDoc.data().reason || "No reason provided";

                  statusUpdates[`${pair} - ${contributionId}`] = {
                    status: "Translation fetched",
                    documentId,
                    contributionId,
                    reason, 
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

  const handleOptionClick = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setShowPopover(false); 
  };


  const renderStars = (rating) => {
    const totalStars = 5;
    const filledStars = rating;
    const unfilledStars = totalStars - filledStars;

    return (
      <>
        {[...Array(filledStars)].map((_, index) => (
          <i key={index} className="material-symbols-outlined rating-star filled">star</i>
        ))}
        {[...Array(unfilledStars)].map((_, index) => (
          <i key={index} className="material-symbols-outlined rating-star">star</i>
        ))}
      </>
    );
  };

 
  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Popover Title</Popover.Header>
      <Popover.Body>
        <button onClick={() => handleOptionClick("Option 1 clicked")}>Option 1</button>
        <button onClick={() => handleOptionClick("Option 2 clicked")}>Option 2</button>
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
      <div className="top-container-comment">
        <h1>Reported Contributions</h1>
      </div>
      <div className="content-container">
        <div className="left-section">
          <h2>Contribution Details</h2>
          {selectedContribution ? (
            <div className="container-card">
              <div className="contribution-card">
                <div className="contribution-upper">
                  <div className="profile-section">
                    <div className="profile-img">
                    <i className="material-symbols-outlined profile-icon">
                      person
                    </i>
                    </div>
                 

                    <div className="user-details">
                      <p className="email-text">
                        {selectedContribution.data.user_email}
                      </p>
                      <p className="timestamp">
                        {new Date(
                          selectedContribution.data.timestamp.seconds * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="status-section">
                    <i
                      className={`material-symbols-outlined profile-icon-main${
                        selectedContribution.data.verified
                          ? "verified"
                          : "not-verified"
                      }`}
                    >
                      verified
                    </i>
                    <i
                      className={`material-symbols-outlined profile-icon ${
                        selectedContribution.data.approved
                          ? "approved"
                          : "not-approved"
                      }`}
                    >
                      recommend
                    </i>

                    <div>
                      <OverlayTrigger
                        trigger="click"
                        placement="right"
                        overlay={popover}
                      >
                        <i className="material-symbols-outlined profile-icon">
                          more_horiz
                        </i>
                      </OverlayTrigger>
                      <div className="toast-container">
                        <Toast
                          onClose={() => setShowToast(false)}
                          show={showToast}
                          delay={3000}
                          autohide
                        >
                          <Toast.Header>
                            <img src="..." className="rounded me-2" alt="..." />
                            <strong className="me-auto">
                              Bootstrap{" "}
                              {selectedContribution.data.contribution_id}
                            </strong>
                            <small>Just now</small>
                            <button
                              type="button"
                              className="btn-close"
                              data-bs-dismiss="toast"
                              aria-label="Close"
                            ></button>
                          </Toast.Header>
                          <Toast.Body>{toastMessage}</Toast.Body>
                        </Toast>
                      </div>
                    </div>
                    <i className="material-symbols-outlined profile-icon">
                      more_horiz
                    </i>
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
                      <img
                        src={selectedContribution.data.image_url}
                        alt="Contribution"
                      />
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
  {loadingComments ? (
    <p>Loading comments...</p>
  ) : (
    comments.length > 0 ? (
      comments.map((comment) => (
        <Card className="comment-card mb-3" key={comment.comment_id}>
          <Card.Header>
            <div className="comment-user">
            <i className="material-symbols-outlined user-icon">person</i>
              <div className="email">
              {comment.user_email}
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <blockquote className="blockquote mb-0">
              <p>
              {comment.comment}
              </p>
              <p>
              <div className="rating">
              {renderStars(comment.rating)}
            </div>              
            </p>
            
              <footer className="blockquote-footer">
                {new Date(comment.timestamp).toLocaleString()}
              </footer>
            </blockquote>
          </Card.Body>
        </Card>
      ))
    ) : (
      <p>No comments available.</p>
    )
  )}
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
                  <li
                    className="list-group-item item-right"
                    key={key}
                    onClick={() => handleCardClick(key)}
                  >
                    <div className="upper-card">
                      <div className="profile-container">
                        <i className="material-symbols-outlined profile-icon">
                          person
                        </i>
                      </div>

                      <div className="details">
                        <p className="email-text">{data.user_email}</p>
                        <p className="timestamp">
                          {new Date(
                            data.timestamp.seconds * 1000
                          ).toLocaleString()}
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
                      <p>
                        Correction Submitted:{" "}
                        <strong>{data.contributed_text}</strong>
                      </p>
                      <p>
                        Translated output: <strong>{data.output_main}</strong>
                      </p>
                      <p>
                        Input: <strong>{data.input_main}</strong>
                      </p>
                      <p>
                        <strong>Reason:</strong> {statuses[key].reason}
                      </p>
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
