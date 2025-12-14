import admin from "firebase-admin";

function getCreds() {
  // First, try to use service account key from environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const keyValue = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();

    // Check if the key is too short (likely incomplete)
    if (keyValue.length < 50) {
      console.error(
        "❌ FIREBASE_SERVICE_ACCOUNT_KEY is too short (",
        keyValue.length,
        "chars)."
      );
      console.error(
        "   This usually means the JSON is not properly formatted in .env file."
      );
      console.error(
        "   Make sure FIREBASE_SERVICE_ACCOUNT_KEY is on a single line in .env file."
      );
      console.error(
        '   Example: FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}'
      );
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY appears to be incomplete. Please check your .env file."
      );
    }

    try {
      const serviceAccount = JSON.parse(keyValue);
      console.log(
        "✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY"
      );
      return admin.credential.cert(serviceAccount);
    } catch (parseError: any) {
      console.error(
        "❌ Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON:",
        parseError.message
      );
      console.error("   First 100 chars of value:", keyValue.substring(0, 100));
      console.error(
        "   Make sure FIREBASE_SERVICE_ACCOUNT_KEY is valid JSON on a single line."
      );
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON. Please check your .env file."
      );
    }
  }

  // If no service account key, try application default credentials
  // This will work if GOOGLE_APPLICATION_CREDENTIALS is set or if running on GCP
  try {
    console.log(
      "⚠️  FIREBASE_SERVICE_ACCOUNT_KEY not found. Trying application default credentials..."
    );
    return admin.credential.applicationDefault();
  } catch (error) {
    console.error("❌ Could not load Firebase credentials:");
    console.error("   - FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env file");
    console.error("   - Application default credentials are not available");
    console.error(
      "   - Please set FIREBASE_SERVICE_ACCOUNT_KEY in your .env file"
    );
    throw new Error(
      "Firebase credentials not found. Please set FIREBASE_SERVICE_ACCOUNT_KEY in your .env file."
    );
  }
}

const initializeFirebase = () => {
  if (admin.apps.length) return admin;

  try {
    const credential = getCreds();

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!projectId || projectId === "your-project-id") {
      console.warn("⚠️  FIREBASE_PROJECT_ID not set or using default value");
    }
    if (!storageBucket || storageBucket === "your-project.appspot.com") {
      console.warn(
        "⚠️  FIREBASE_STORAGE_BUCKET not set or using default value"
      );
    }

    admin.initializeApp({
      credential,
      projectId: projectId || "your-project-id",
      storageBucket: storageBucket || "your-project.appspot.com",
    });

    console.log("🔥 Firebase Admin SDK initialized successfully");
    console.log(`   Project ID: ${projectId || "your-project-id"}`);
    return admin;
  } catch (error: any) {
    console.error("❌ Failed to initialize Firebase:", error.message || error);
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
