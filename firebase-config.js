const firebaseConfig = {
  apiKey: "AIzaSyAePTVnKSUw9owUVamA6bk6MVrYSBhKxEU",
  authDomain: "ambulink-dd25f.firebaseapp.com",
  databaseURL: "https://ambulink-dd25f-default-rtdb.firebaseio.com",
  projectId: "ambulink-dd25f",
  storageBucket: "ambulink-dd25f.firebasestorage.app",
  messagingSenderId: "331876122317",
  appId: "1:331876122317:web:09536ee69465c04b743384"
};

// Expose config globally for script.js
window.firebaseConfig = firebaseConfig;

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}