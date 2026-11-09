const fs = require("fs");
const path = require("path");
const { dbHelperPath } = require("../config/env");

const memoryStore = [];
let warnedAboutFallback = false;
let helperPromise;

function recordToIso(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return String(value);
}

function toPublicFileUrl(filePath) {
  if (!filePath) {
    return null;
  }

  if (typeof filePath === "string" && filePath.startsWith("/uploads/")) {
    return filePath;
  }

  return `/uploads/${path.basename(String(filePath))}`;
}

function normalizeHelperModule(helperModule) {
  const candidate = helperModule && helperModule.default ? helperModule.default : helperModule;

  if (!candidate) {
    return null;
  }

  const createRecording =
    candidate.createRecording ||
    candidate.saveRecording ||
    candidate.insertRecording;

  const getRecordingById =
    candidate.getRecordingById ||
    candidate.findRecordingById ||
    candidate.getAnalysisById;

  const getHistoryByUserId =
    candidate.getHistoryByUserId ||
    candidate.findHistoryByUserId ||
    candidate.getUserHistory;

  if (createRecording && getRecordingById && getHistoryByUserId) {
    return {
      createRecording,
      getRecordingById,
      getHistoryByUserId
    };
  }

  return null;
}

function resolveHelperPath() {
  if (dbHelperPath) {
    return path.isAbsolute(dbHelperPath)
      ? dbHelperPath
      : path.resolve(process.cwd(), dbHelperPath);
  }

  return path.resolve(process.cwd(), "..", "database", "index.js");
}

async function loadExternalHelper() {
  const resolvedPath = resolveHelperPath();

  if (!fs.existsSync(resolvedPath)) {
    return null;
  }

  const helperModule = await import(`file://${resolvedPath.replace(/\\/g, "/")}`);
  const normalized = normalizeHelperModule(helperModule);

  if (normalized) {
    return normalized;
  }

  if (
    helperModule.insertRecording &&
    helperModule.insertAnalysis &&
    helperModule.getHistory &&
    helperModule.getRecordingById &&
    helperModule.getAnalysisByRecording
  ) {
    return {
      async createRecording(record) {
        const recordingId = await helperModule.insertRecording({
          userId: record.userId,
          filePath: record.filePath
        });

        await helperModule.insertAnalysis({
          recordingId,
          ...record.analysis
        });

        return {
          ...record,
          recordingId
        };
      },
      async getRecordingById(recordingId) {
        const recording = await helperModule.getRecordingById(recordingId);

        if (!recording) {
          return null;
        }

        const analyses = await helperModule.getAnalysisByRecording(recordingId);
        const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null;

        return {
          recordingId: recording.id,
          userId: recording.userId,
          filePath: recording.filePath,
          fileUrl: toPublicFileUrl(recording.filePath),
          createdAt: recordToIso(recording.createdAt),
          analysis: latestAnalysis
            ? {
                pitch: latestAnalysis.pitch,
                tremor: latestAnalysis.tremor,
                breathlessness: latestAnalysis.breathlessness,
                speech_rate: latestAnalysis.speech_rate,
                risk_score: latestAnalysis.risk_score,
                risk_level: latestAnalysis.risk_level
              }
            : null
        };
      },
      async getHistoryByUserId(userId) {
        const history = await helperModule.getHistory(userId);

        return history.map((item) => ({
          recordingId: item.recordingId,
          userId,
          filePath: item.filePath,
          fileUrl: toPublicFileUrl(item.filePath),
          createdAt: recordToIso(item.recordedAt),
          analysis: item.analysis
            ? {
                pitch: item.analysis.pitch,
                tremor: item.analysis.tremor,
                breathlessness: item.analysis.breathlessness,
                speech_rate: item.analysis.speech_rate,
                risk_score: item.analysis.risk_score,
                risk_level: item.analysis.risk_level
              }
            : null
        }));
      }
    };
  }

  return null;
}

async function getHelper() {
  if (!helperPromise) {
    helperPromise = loadExternalHelper().catch((error) => {
      console.warn("[dbAdapter] Failed to load external DB helper:", error.message);
      return null;
    });
  }

  return helperPromise;
}

function warnFallback() {
  if (!warnedAboutFallback) {
    warnedAboutFallback = true;
    console.warn(
      "[dbAdapter] No DB helper found. Using in-memory fallback store for now."
    );
  }
}

async function createRecording(record) {
  const helper = await getHelper();

  if (helper) {
    return helper.createRecording(record);
  }

  warnFallback();
  memoryStore.push(record);
  return record;
}

async function getRecordingById(recordingId) {
  const helper = await getHelper();

  if (helper) {
    return helper.getRecordingById(recordingId);
  }

  warnFallback();
  return memoryStore.find((item) => item.recordingId === recordingId) || null;
}

async function getHistoryByUserId(userId) {
  const helper = await getHelper();

  if (helper) {
    return helper.getHistoryByUserId(userId);
  }

  warnFallback();
  return memoryStore
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  createRecording,
  getRecordingById,
  getHistoryByUserId
};
