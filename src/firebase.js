import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from"@firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBZM5Tggt6h0_agKedManIg6h4mecE0ka8",
  authDomain: "hotspots-9bdd4.firebaseapp.com",
  databaseURL: "https://hotspots-9bdd4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hotspots-9bdd4",
  storageBucket: "hotspots-9bdd4.appspot.com",
  messagingSenderId: "575250317209",
  appId: "1:575250317209:web:ca4dfad7f0f51d168fdd08",
  measurementId: "G-YJYNJKJFSH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app);
const storage = getStorage(app)

export {app, auth, db, storage}