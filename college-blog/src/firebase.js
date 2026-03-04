import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD91SZU3cqTBJ9my1ih7WQcqzhSKtwtT4I",
  authDomain: "my-blog-app-b3582.firebaseapp.com",
  projectId: "my-blog-app-b3582",
  storageBucket: "my-blog-app-b3582.firebasestorage.app",
  messagingSenderId: "26723015129",
  appId: "1:26723015129:web:5196d957ef75d8f142e1c8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);