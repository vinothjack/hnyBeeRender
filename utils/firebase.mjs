import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://hnybee-35b5b.firebasestorage.app", // Ensure this matches your Firebase Storage bucket
});

const bucket = getStorage().bucket();
export { bucket };
