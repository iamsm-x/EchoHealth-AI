// database/recordings.js
// Collection: "recordings"
// Schema: { userId, filePath, createdAt }

import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "recordings";

/**
 * Insert a new voice recording entry into Firestore.
 * Called after a voice file is saved to storage.
 *
 * @param {Object} data
 * @param {string} data.userId   - Firestore ID of the user (from "users" collection)
 * @param {string} data.filePath - Storage path / URL of the audio file
 * @returns {Promise<string>} - The new recording's Firestore document ID
 *
 * @example
 * const recId = await insertRecording({
 *   userId: "abc123",
 *   filePath: "recordings/abc123/2024-04-11.wav"
 * });
 */
export async function insertRecording({ userId, filePath }) {
  if (!userId || !filePath) {
    throw new Error("insertRecording: 'userId' and 'filePath' are required.");
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    userId,
    filePath,
    createdAt: serverTimestamp(),
  });

  console.log(`[recordings] Inserted recording with ID: ${docRef.id}`);
  return docRef.id;
}

/**
 * Fetch a single recording by its Firestore document ID.
 *
 * @param {string} recordingId
 * @returns {Promise<Object|null>}
 */
export async function getRecordingById(recordingId) {
  if (!recordingId) throw new Error("getRecordingById: 'recordingId' is required.");

  const docSnap = await getDoc(doc(db, COLLECTION, recordingId));
  if (!docSnap.exists()) {
    console.warn(`[recordings] No recording found with ID: ${recordingId}`);
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Get all recordings for a specific user, ordered by newest first.
 *
 * @param {string} userId
 * @returns {Promise<Array>} - Array of recording objects
 */
export async function getRecordingsByUser(userId) {
  if (!userId) throw new Error("getRecordingsByUser: 'userId' is required.");

  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const aTime = a.createdAt && typeof a.createdAt.toDate === "function"
        ? a.createdAt.toDate().getTime()
        : 0;
      const bTime = b.createdAt && typeof b.createdAt.toDate === "function"
        ? b.createdAt.toDate().getTime()
        : 0;

      return bTime - aTime;
    });
}
