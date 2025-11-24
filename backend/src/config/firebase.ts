import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Initialize Firebase Admin SDK
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        );
        credential = admin.credential.cert(serviceAccount);
      } catch (parseError) {
        console.warn(
          "⚠️  Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON. Using default credentials."
        );
        credential = admin.credential.applicationDefault();
      }
    } else {
      console.warn(
        "⚠️  Firebase service account key not found. Using default credentials."
      );
      credential = admin.credential.applicationDefault();
    }

    firebaseApp = admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
    });

    console.log("🔥 Firebase Admin SDK initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
    // Don't throw error in development, just log it
    if (process.env.NODE_ENV === "production") {
      throw error;
    } else {
      console.warn("⚠️  Continuing without Firebase in development mode");
      return null as any;
    }
  }
};

export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error(
      "Firebase not initialized. Call initializeFirebase() first."
    );
  }
  return firebaseApp;
};

export const getFirestoreInstance = () => {
  const app = getFirebaseApp();
  return getFirestore(app);
};

export default firebaseApp;
