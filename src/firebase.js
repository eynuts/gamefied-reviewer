// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDuFpDbExI_IZ0H_X8hXn_seM2VpUapSt4",
    authDomain: "gamefied-reviewer.firebaseapp.com",
    projectId: "gamefied-reviewer",
    storageBucket: "gamefied-reviewer.firebasestorage.app",
    messagingSenderId: "498103622944",
    appId: "1:498103622944:web:f36bd14fa35fec86f44b45",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider as googleProvider, signInWithPopup, signOut };
