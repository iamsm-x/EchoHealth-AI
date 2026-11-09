// database/users.js
// Collection: "users"
// Schema: { name, email, createdAt }

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

const COLLECTION = "users";

/**
 * Create a new user in the "users" collection.
 *
 * @param {Object} data
 * @param {string} data.name  - Full name of the user
 * @param {string} data.email - Email address (should be unique)
 * @returns {Promise<string>} - The new user's Firestore document ID
 *
 * @example
 * const userId = await insertUser({ name: "Riya Shah", email: "riya@example.com" });
 */
export async function insertUser({ name, email }) {
  if (!name || !email) {
    throw new Error("insertUser: 'name' and 'email' are required.");
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    email,
    createdAt: serverTimestamp(),
  });

  console.log(`[users] Created user with ID: ${docRef.id}`);
  return docRef.id;
}

/**
 * Fetch a single user by their Firestore document ID.
 *
 * @param {string} userId - Firestore document ID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function getUserById(userId) {
  if (!userId) throw new Error("getUserById: 'userId' is required.");

  const docSnap = await getDoc(doc(db, COLLECTION, userId));
  if (!docSnap.exists()) {
    console.warn(`[users] No user found with ID: ${userId}`);
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Find a user by their email address.
 *
 * @param {string} email
 * @returns {Promise<Object|null>} - First matching user or null
 */
export async function getUserByEmail(email) {
  if (!email) throw new Error("getUserByEmail: 'email' is required.");

  const q = query(collection(db, COLLECTION), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.warn(`[users] No user found with email: ${email}`);
    return null;
  }

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}
