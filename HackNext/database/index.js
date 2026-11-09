// database/index.js
// ─────────────────────────────────────────────────────────────
// Single entry point for the entire database layer.
// Backend team: import ONLY from here.
//
// Usage:
//   import { insertRecording, insertAnalysis, getHistory } from "./database/index.js";
// ─────────────────────────────────────────────────────────────

export {
  insertRecording,
  insertAnalysis,
  getHistory,
  getAnalysisByRecording,
  insertUser,
  getUserById,
  getUserByEmail,
  getRecordingById,
  getAnalysisById,
} from "./queries.js";

export { db } from "./firebaseConfig.js";
