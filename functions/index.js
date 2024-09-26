const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Configure the email transporter using your email provider's settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jomarasisgriffin@gmail.com',
    pass: '!Whatadrag16!',
  },
});

exports.sendEmail = functions.https.onCall((data, context) => {
  const { to, subject, body } = data;

  const mailOptions = {
    from: 'jomarasisgriffin@gmail.com',
    to,
    subject,
    text: body,
  };

  return transporter.sendMail(mailOptions)
    .then((info) => {
      return { success: true, message: 'Email sent successfully!', info };
    })
    .catch((error) => {
      return { success: false, message: 'Error sending email', error };
    });
});
