
import { initializeApp, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  type Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  addDoc, 
  deleteDoc, 
  doc,
  getDoc,
  setDoc,
  getDocs,
  where,
  serverTimestamp,
  type Firestore,
  type Query,
  type CollectionReference
} from "firebase/firestore";
import type { Quiz } from '../types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLeBmdJ85IhfeJ7sGBHOlSjUmYJ6V_YIY",
  authDomain: "thpt-chi-linh.firebaseapp.com",
  projectId: "thpt-chi-linh",
  storageBucket: "thpt-chi-linh.firebasestorage.app",
  messagingSenderId: "59436766218",
  appId: "1:59436766218:web:8621e33cc12f6129e6fbf3",
  measurementId: "G-442TZLSK9J"
};


// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

const quizzesCollection = collection(db, "quizzes");
export const whitelistCollection = collection(db, "whitelist");

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export const signUpWithEmail = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const sendPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email);
};

export const signOutUser = () => {
  return signOut(auth);
};

export { auth };

// Quiz Functions
export const getQuizzesQuery = (): Query => {
    return query(quizzesCollection);
}

const extractSrcAndTitle = (embedCode: string): { src: string, title: string } => {
    const srcMatch = embedCode.match(/src="([^"]*)"/);
    const titleMatch = embedCode.match(/title="([^"]*)"/);

    if (!srcMatch || !srcMatch[1]) {
        throw new Error("Could not find a valid 'src' attribute in the embed code.");
    }

    const src = srcMatch[1];
    const title = titleMatch && titleMatch[1] ? titleMatch[1] : "Untitled Content";

    return { src, title };
}


export const addQuiz = async (ownerId: string, embedCode: string): Promise<{ quizUrl: string, title: string }> => {
    if (!embedCode || !embedCode.trim()) {
        throw new Error("Embed code cannot be empty.");
    }
    const { src, title } = extractSrcAndTitle(embedCode);

    const newQuizData = {
        title,
        embedCode,
        quizUrl: src,
        createdAt: serverTimestamp(),
        ownerId
    };

    await addDoc(quizzesCollection, newQuizData);
    return { quizUrl: src, title };
};


export const deleteQuiz = (docId: string) => {
  const quizDoc = doc(db, "quizzes", docId);
  return deleteDoc(quizDoc);
};


// Whitelist functions
export const isUserWhitelisted = async (email: string): Promise<boolean> => {
    if (!email) return false;
    // Use getDoc for a direct lookup, which is more efficient and works with the new security rules.
    const docRef = doc(db, "whitelist", email.toLowerCase());
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
};

export const addToWhitelist = async (email: string): Promise<void> => {
    const emailToAdd = email.toLowerCase();
    const docRef = doc(db, "whitelist", emailToAdd);

    // Check if the user is already whitelisted to provide a specific error message.
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        throw new Error("Email is already on the whitelist.");
    }

    // Use setDoc to create a document with the email as its ID.
    await setDoc(docRef, { addedAt: serverTimestamp() });
};

export const removeFromWhitelist = async (email: string): Promise<void> => {
    const emailToRemove = email.toLowerCase();
    const docRef = doc(db, "whitelist", emailToRemove);
    
    // No need to query. Just attempt to delete the document directly.
    // The security rules will prevent unauthorized deletions.
    await deleteDoc(docRef);
};
