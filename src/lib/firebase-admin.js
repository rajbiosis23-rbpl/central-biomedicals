import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.replace(/^"|"$/g, "")
  .replace(/\\n/g, "\n");

let db = null;

if (projectId && clientEmail && privateKey) {
  try {
    const app =
      getApps().length === 0
        ? initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        })
        : getApps()[0];

    db = getFirestore(app);
  } catch (err) {
    console.warn("Firebase Admin init warning:", err.message);
  }
} else {
  console.warn("Firebase Admin environment variables missing. Admin db disabled for static build.");
}

export const adminDb = db;