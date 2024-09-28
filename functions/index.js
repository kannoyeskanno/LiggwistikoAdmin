const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin
admin.initializeApp();

// Email configuration (use your credentials)
const transporter = nodemailer.createTransport({
  service: "gmail", // Or another email service
  auth: {
    user: "devtest9142001@gmail.com", // Sender email
    pass: "devtest12345!", // Use your app password if you're using Gmail
  },
});

// Test send email endpoint
exports.testSendEmail = functions.https.onRequest((req, res) => {
  const email = req.query.email || "jomarasisgriffin@gmail.com"; // Default email for testing
  const settings = {
    notifyApproval: true,
    notifyRejection: false,
    notifyStatus: true,
  };

  sendEmail(email, settings)
    .then(() => {
      res.status(200).send(`Test email sent to ${email}`);
    })
    .catch((error) => {
      res.status(500).send("Error sending test email: " + error.toString());
    });
});

// Helper function to send an email
function sendEmail(userEmail, settings) {
  const mailOptions = {
    from: "devtest9142001@gmail.com", // Sender address
    to: userEmail,
    subject: "Test Notification",
    text: generateEmailContent(settings),
  };

  return transporter
    .sendMail(mailOptions)
    .then(() => {
      console.log(`Email sent to ${userEmail}`);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
}

// Generate email content based on user settings
function generateEmailContent(settings) {
  let message = "Test Notification: \n\n";
  if (settings.notifyApproval) {
    message += "- This is a test for document approvals.\n";
  }
  if (settings.notifyRejection) {
    message += "- This is a test for document rejections.\n";
  }
  if (settings.notifyStatus) {
    message += "- This is a test for status updates.\n";
  }

  return message;
}
