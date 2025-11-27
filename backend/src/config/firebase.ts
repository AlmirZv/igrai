import admin from "firebase-admin";

function getCreds() {
  let credential = admin.credential.applicationDefault();

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = admin.credential.cert(serviceAccount);
    } catch (parseError) {
      console.warn("⚠️  Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON. Using default credentials.");
    }
  } else {
    console.warn("⚠️  Firebase service account key not found. Using default credentials.");
  }

  return credential;
}

const initializeFirebase = () => {
  if (admin.apps.length) return admin;

  try {
    const credential = getCreds();

    admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
    });

    console.log("🔥 Firebase Admin SDK initialized successfully");
    return admin;
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

const firebaseAdmin = initializeFirebase();

export const db = firebaseAdmin.firestore();
export const auth = firebaseAdmin.auth();
export const storage = firebaseAdmin.storage();
export const messaging = firebaseAdmin.messaging();
export default firebaseAdmin;
