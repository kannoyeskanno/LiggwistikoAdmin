import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Toast from "react-bootstrap/Toast";
import "./Comments.css";
import { Popover, OverlayTrigger } from "react-bootstrap";
import Tooltip from "react-bootstrap/Tooltip";
import Card from "react-bootstrap/Card";
import EmptyIMG from "../../images/empty-inbox.png";

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
   
    fetchAllContributions();
  }, [languagePairs]);

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
                const translationData = translationSnap.data();
                const reason =
                  contributionDoc.data().reason || "No reason provided";

                statusUpdates[`${pair} - ${contributionId}`] = {
                  status: "Translation fetched",
                  documentId,
                  contributionId,
                  reason,
                  data: translationData || {},
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
        And here's some <strong>amazing</strong> content. It's very engaging. right?
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

  const DisabledBanner = () => (
    <div className="disabled-message">
      <h2>This contribution is disabled</h2>
      <p>New incoming comments will not be added because this contribution is disabled.</p>

      <button onClick={() => handleEnable(selectedContribution, "enabled")}>Enable</button>
    </div>
  );

  const handleEnable = async (selectedContribution, newStatus) => {
    try {
      const documentId = selectedContribution.data.document_id;
      const contributionId = selectedContribution.data.contribution_id;

      console.log(documentId);
      console.log(contributionId);

      const contributionRef = doc(db, `/translations/${documentId}/contributions/${contributionId}`);

      await updateDoc(contributionRef, {
        status: newStatus
      });

      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const handleDelete = async (selectedContribution) => {
    try {
      const documentId = selectedContribution.data.document_id;
      const contributionId = selectedContribution.data.contribution_id;
  
      const commentRef = doc(db, `/translations/${documentId}/contributions/${contributionId}`);
      const reportRef = doc(db, `/reports/${documentId}/contributions/${contributionId}`);
  
      await deleteDoc(commentRef);
      await deleteDoc(reportRef);
  
      setComments((prevComments) => 
        prevComments.filter(comment => 
          comment.document_id !== documentId && comment.contribution_id !== contributionId
        )
      );
  
  
      setToastMessage("Comment deleted successfully.");
      setShowToast(true);
      await fetchAllContributions(); 

    } catch (error) {
      console.error("Error deleting comment:", error);
      setToastMessage("Error: Unable to delete comment.");
      setShowToast(true);
    }
  };
  
  
  const handleDisable = async (selectedContribution, newStatus) => {
    try {
      const documentId = selectedContribution.data.document_id;
      const contributionId = selectedContribution.data.contribution_id;

      console.log(documentId);
      console.log(contributionId);

      const contributionRef = doc(db, `/translations/${documentId}/contributions/${contributionId}`);

      await updateDoc(contributionRef, {
        status: newStatus
      });

      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const EmptyComments = () => (
    <div className="empty-comments">
      <img src={EmptyIMG} alt="No comments available" />
      <p>No comments available.</p>
    </div>
  );

  const CommentCard = ({ comment }) => (
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
          <p>{comment.comment}</p>
          <p>
            <div className="rating">{renderStars(comment.rating)}</div>
          </p>
          <footer className="blockquote-footer">
            {new Date(comment.timestamp).toLocaleString()}
          </footer>
        </blockquote>
      </Card.Body>
    </Card>
  );

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
                  <div className="action-buttons">
                    <button className="delete-button" onClick={() => handleDelete(selectedContribution)}>Delete</button>
                    <button className="disable-button" onClick={() => handleDisable(selectedContribution, "disabled")}>Disable</button>

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
                   
                  </div>
                </div>
                <div className="contribution-body p-4 border rounded shadow-sm bg-light">
  <div className="contribution-header mb-3 d-flex justify-content-between align-items-center">
    <h5 className="text-primary">Contribution Details</h5>
    <small className="text-muted">Language: {selectedContribution?.data?.document_id || "N/A"}</small>
  </div>

  <div className="contribution-content">
    <p className="mb-2">
      <strong>Contributed Text:</strong>{" "}
      {selectedContribution?.data?.contributed_text || "N/A"}
    </p>
    <p className="mb-2">
      <strong>Output Main:</strong>{" "}
      {selectedContribution?.data?.output_main || "N/A"}
    </p>
    <p className="mb-2">
      <strong>Input Main:</strong>{" "}
      {selectedContribution?.data?.input_main || "N/A"}
    </p>
    <p className="mb-2">
      <strong>Description:</strong>{" "}
      {selectedContribution?.data?.descrption || "N/A"}
    </p>
    <p className="mb-2">
      <strong>Note:</strong>{" "}
      {selectedContribution?.data?.target_note || "N/A"}
    </p>
    <p className="mb-2">
      <strong>Target Definition:</strong>{" "}
      {selectedContribution?.data?.target_definition || "N/A"}
    </p>
  </div>

  {selectedContribution?.data?.image_url && (
    <div className="image-container text-center mt-4">
      <img
        src={selectedContribution.data.image_url}
        alt="Contribution"
        className="img-fluid rounded border"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  )}

  <div className="contribution-footer mt-4 text-muted small">
    <p>Last updated on: <strong>{new Date().toLocaleDateString()}</strong></p>
  </div>
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
              {selectedContribution ? (
                <div className="banner">
                  <div className="comment-banner">
                    {selectedContribution.data.status === 'disabled' ? (
                      <DisabledBanner />
                    ) : null}
                  </div>
                </div>
              ) : (
                <p>No contribution selected.</p>
              )}

              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentCard comment={comment} key={comment.comment_id} />
                ))
              ) : (
                <EmptyComments />
              )}
            </div>
          )}
        </div>
        <div className="right-section">
  {loading ? (
    <div className="shimmer-container shimmer"></div>
  ) : Object.keys(statuses).length === 0 || Object.keys(statuses).every(key => statuses[key].status === "No contribution data found") ? (
    <div className="no-reports-container">
      <img src="/path/to/your/empty-image.png" alt="No reports" className="no-reports-image" />
      <p className="no-reports-text">Oops, no reports fetched!</p>
    </div>
  ) : (
    <ul className="list-group">
      {Object.keys(statuses).map((key) => {
        const { documentId, contributionId, status, data } = statuses[key];

        if (status === "No contribution data found") {
          return null; // Skip empty contributions
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
                <p className="email-text">{data?.user_email || "No email provided"}</p>
                <p className="timestamp">
                  {data?.timestamp
                    ? new Date(data.timestamp.seconds * 1000).toLocaleString()
                    : "No timestamp"}
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
                <strong>{data?.contributed_text || "No text provided"}</strong>
              </p>
              <p>
                Translated output:{" "}
                <strong>{data?.output_main || "No output"}</strong>
              </p>
              <p>
                Input: <strong>{data?.input_main || "No input"}</strong>
              </p>
              <p>
                <strong>Reason:</strong> {statuses[key].reason || "No reason provided"}
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