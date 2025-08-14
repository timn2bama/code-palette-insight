import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_WEB_API_KEY",
  authDomain: "syncstyle-9414d.firebaseapp.com",
  databaseURL: "https://syncstyle-9414d-default-rtdb.firebaseio.com",
  projectId: "syncstyle-9414d",
  storageBucket: "syncstyle-9414d.appspot.com",
  messagingSenderId: "962556306608",
  appId: "YOUR_WEB_APP_ID",
  measurementId: "G-501390343"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
