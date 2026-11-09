// database/analysisResults.js
// Collection: "analysis_results"
// Schema: { recordingId, pitch, tremor, breathlessness, speech_rate, risk_level, createdAt }

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

const COLLECTION = "analysis_results";

// Valid risk levels accepted by the system
const VALID_RISK_LEVELS = ["low", "medium", "high"];

/**
 * Insert an AI/ML analysis result linked to a recording.
 *
 * @param {Object} data
 * @param {string} data.recordingId    - Firestore ID from "recordings" collection
 * @param {number} data.pitch          - Average pitch in Hz (e.g. 120.5)
 * @param {number} data.tremor         - Tremor intensity score (0.0 – 1.0)
 * @param {number} data.breathlessness - Breathlessness score (0.0 – 1.0)
 * @param {number} data.speech_rate    - Words or syllables per second
 * @param {number} data.risk_score     - Calculated AI risk score (0-100)
 * @param {string} data.risk_level     - One of: "low" | "medium" | "high"
 * @returns {Promise<string>} - Firestore document ID of the inserted analysis
 *
 * @example
 * const analysisId = await insertAnalysis({
 *   recordingId: "rec_xyz789",
 *   pitch: 118.4,
 *   tremor: 0.32,
 *   breathlessness: 0.21,
 *   speech_rate: 3.7,
 *   risk_level: "medium"
 * });
 */
export async function insertAnalysis({
  recordingId,
  pitch,
  tremor,
  breathlessness,
  speech_rate,
  risk_score,
  risk_level,
}) {
  // --- Validation ---
  if (!recordingId) throw new Error("insertAnalysis: 'recordingId' is required.");
  if (pitch === undefined || pitch === null) throw new Error("insertAnalysis: 'pitch' is required.");
  if (tremor === undefined || tremor === null) throw new Error("insertAnalysis: 'tremor' is required.");
  if (breathlessness === undefined || breathlessness === null)
    throw new Error("insertAnalysis: 'breathlessness' is required.");
  if (speech_rate === undefined || speech_rate === null)
    throw new Error("insertAnalysis: 'speech_rate' is required.");
  if (risk_score === undefined || risk_score === null)
    throw new Error("insertAnalysis: 'risk_score' is required.");
  if (!VALID_RISK_LEVELS.includes(risk_level)) {
    throw new Error(
      `insertAnalysis: 'risk_level' must be one of ${VALID_RISK_LEVELS.join(", ")}. Got: "${risk_level}"`
    );
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    recordingId,
    pitch: Number(pitch),
    tremor: Number(tremor),
    breathlessness: Number(breathlessness),
    speech_rate: Number(speech_rate),
    risk_score: Number(risk_score),
    risk_level,
    createdAt: serverTimestamp(),
  });

  console.log(`[analysis_results] Inserted analysis with ID: ${docRef.id}`);
  return docRef.id;
}

/**
 * Fetch a single analysis result by its Firestore document ID.
 *
 * @param {string} analysisId
 * @returns {Promise<Object|null>}
 */
export async function getAnalysisById(analysisId) {
  if (!analysisId) throw new Error("getAnalysisById: 'analysisId' is required.");

  const docSnap = await getDoc(doc(db, COLLECTION, analysisId));
  if (!docSnap.exists()) {
    console.warn(`[analysis_results] No analysis found with ID: ${analysisId}`);
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Get all analysis results for a specific recording.
 *
 * @param {string} recordingId
 * @returns {Promise<Array>}
 */
export async function getAnalysisByRecording(recordingId) {
  if (!recordingId) throw new Error("getAnalysisByRecording: 'recordingId' is required.");

  const q = query(
    collection(db, COLLECTION),
    where("recordingId", "==", recordingId)
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
