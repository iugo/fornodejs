require('dotenv').config();
const admin = require('firebase-admin');

console.log(process.env.FIREBASE_PRIVATE_KEY);
console.log(typeof process.env.FIREBASE_PRIVATE_KEY);
console.log(process.env.FIREBASE_PRIVATE_KEY.toString());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
  }),
  databaseURL: process.env.FIREBASE_DB_URL
});

module.exports = admin.database();
