import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  User
} from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// Default Firebase configuration (v3-certif project)
// Use environment variables if available, otherwise fall back to these defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCOLNFqHVqCuXfAET67rqYDIAqaQoPv05Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "v3-certif.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "v3-certif",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "v3-certif.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "670942291000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:670942291000:web:35d2f2d26c058d651df2cd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JBM6020CFK"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Export Firebase services for use in components
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics only in browser environment
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}
export { analytics };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth helper functions
export const signInWithProvider = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const registerWithEmail = async (email: string, password: string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = async (user: User, data: { displayName?: string; photoURL?: string }): Promise<void> => {
  await firebaseUpdateProfile(user, data);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export default app;