const firebaseConfig = {
  apiKey: "AIzaSyAuiCdg89pw8zxX1bfkRrq2FA6GNUt37uY",
  authDomain: "skandafocus.firebaseapp.com",
  projectId: "skandafocus",
  storageBucket: "skandafocus.firebasestorage.app",
  messagingSenderId: "1080028195016",
  appId: "1:1080028195016:web:d90063ae03d1d37b2eddfd"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
