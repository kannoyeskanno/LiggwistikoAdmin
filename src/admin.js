const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com',
});

// Function to get the total user count
const getUserCount = async () => {
  let userCount = 0;
  try {
    const listUsersResult = await admin.auth().listUsers();
    userCount = listUsersResult.users.length;
  } catch (error) {
    console.log('Error fetching user data:', error);
  }
  return userCount;
};

module.exports = { getUserCount };
