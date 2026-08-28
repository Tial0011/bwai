/**
 * BWAI — Firebase configuration scaffold
 *
 * FUTURE USE:
 * 1. Create a Firebase project.
 * 2. Register the BWAI web app in Firebase.
 * 3. Copy this file to `firebase-config.js`.
 * 4. Replace the placeholder values with your Firebase web-app config.
 * 5. Never put Admin SDK credentials, service-account JSON, or private
 *    API secrets in this file or in frontend code.
 *
 * Firebase Web API keys are identifiers, not passwords. Security should
 * come from Firebase Authentication and Firestore Security Rules.
 */
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};
