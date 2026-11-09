// database/queries.js
// ─────────────────────────────────────────────────────────
// Central query layer — this is the ONLY file the backend
// needs to import. All DB logic stays inside /database.
// ─────────────────────────────────────────────────────────

import { insertUser, getUserById, getUserByEmail } from "./users.js";
import { insertRecording, getRecordingById, getRecordingsByUser } from "./recordings.js";
import { insertAnalysis, getAnalysisById, getAnalysisByRecording } from "./analysisResults.js";

// ──────────────────────────────────────────────
// INSERT RECORDING
// Called after the backend saves the audio file
// ──────────────────────────────────────────────
/**
 * Save a new voice recording reference to Firestore.
 *
 * @param {Object} data
 * @param {string} data.userId   - ID of the user who recorded
 * @param {string} data.filePath - Path/URL of the stored audio file
 * @returns {Promise<string>} recordingId
 *
 * @example
 * // In your backend route:
 * const recordingId = await insertRecordingQuery({
 *   userId: "user_abc123",
 *   filePath: "audio/user_abc123/2024-04-11T10:30:00.wav"
 * });
 */
async function insertRecordingQuery(data) {
  return await insertRecording(data);
}

// ──────────────────────────────────────────────
// INSERT ANALYSIS
// Called after ML model processes the recording
// ──────────────────────────────────────────────
/**
 * Save the ML model's analysis result for a recording.
 *
 * @param {Object} data
 * @param {string} data.recordingId    - ID of the linked recording
 * @param {number} data.pitch          - Pitch in Hz
 * @param {number} data.tremor         - Tremor score 0.0–1.0
 * @param {number} data.breathlessness - Breathlessness score 0.0–1.0
 * @param {number} data.speech_rate    - Speech rate (units/sec)
 * @param {string} data.risk_level     - "low" | "medium" | "high"
 * @returns {Promise<string>} analysisId
 *
 * @example
 * const analysisId = await insertAnalysisQuery({
 *   recordingId: "rec_xyz789",
 *   pitch: 118.4,
 *   tremor: 0.32,
 *   breathlessness: 0.21,
 *   speech_rate: 3.7,
 *   risk_level: "medium"
 * });
 */
async function insertAnalysisQuery(data) {
  return await insertAnalysis(data);
}

// ──────────────────────────────────────────────────────────────────────
// GET HISTORY
// Returns full timeline for a user: recordings + analysis, joined
// Useful for: Progress Tracking Dashboard / Alert system
// ──────────────────────────────────────────────────────────────────────
/**
 * Fetch complete voice health history for a user.
 * Joins recordings ← analysis_results for dashboard display.
 *
 * @param {string} userId - Firestore user document ID
 * @returns {Promise<Array>} - Array of enriched history objects, newest first
 *
 * Each item in the array looks like:
 * {
 *   recordingId: "rec_xyz",
 *   filePath: "audio/...",
 *   recordedAt: Timestamp,
 *   analysis: {
 *     pitch: 118.4,
 *     tremor: 0.32,
 *     breathlessness: 0.21,
 *     speech_rate: 3.7,
 *     risk_level: "medium",
 *     analyzedAt: Timestamp
 *   } | null   ← null if analysis hasn't been run yet
 * }
 *
 * @example
 * const history = await getHistory("user_abc123");
 * // → [{ recordingId, filePath, recordedAt, analysis: { pitch, ... } }, ...]
 */
async function getHistory(userId) {
  if (!userId) throw new Error("getHistory: 'userId' is required.");

  // Step 1: Get all recordings for this user (newest first)
  const recordings = await getRecordingsByUser(userId);

  if (recordings.length === 0) {
    console.log(`[queries] No recordings found for userId: ${userId}`);
    return [];
  }

  // Step 2: For each recording, fetch its analysis result
  // Using Promise.all for parallel Firestore reads (faster)
  const history = await Promise.all(
    recordings.map(async (rec) => {
      const analyses = await getAnalysisByRecording(rec.id);

      // Take the most recent analysis (already ordered desc)
      const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

      return {
        recordingId: rec.id,
        filePath: rec.filePath,
        recordedAt: rec.createdAt,
        analysis: latestAnalysis
          ? {
              pitch: latestAnalysis.pitch,
              tremor: latestAnalysis.tremor,
              breathlessness: latestAnalysis.breathlessness,
              speech_rate: latestAnalysis.speech_rate,
              risk_score: latestAnalysis.risk_score,
              risk_level: latestAnalysis.risk_level,
              analyzedAt: latestAnalysis.createdAt,
            }
          : null,
      };
    })
  );

  return history;
}

// ──────────────────────────────────────────────
// EXPORTS — backend imports only from here
// ──────────────────────────────────────────────
export {
  // Core required queries
  insertRecordingQuery as insertRecording,
  insertAnalysisQuery  as insertAnalysis,
  getHistory,

  // User helpers (for auth / registration layer)
  insertUser,
  getUserById,
  getUserByEmail,

  // Low-level helpers (optional, for advanced backend use)
  getRecordingById,
  getAnalysisById,
  getAnalysisByRecording,
};
