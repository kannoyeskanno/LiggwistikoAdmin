import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTjTubxc1cnc9ldSa-NG533oFgQhM_Xso",
  authDomain: "linggwistiko.firebaseapp.com",
  projectId: "linggwistiko",
  storageBucket: "linggwistiko.appspot.com",
  messagingSenderId: "251951923681",
  appId: "1:251951923681:web:89db443a6043c5919b12a0",
  measurementId: "G-QL860B6ZV7"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
