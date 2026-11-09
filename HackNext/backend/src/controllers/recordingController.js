const { successResponse } = require("../utils/apiResponse");
const recordingService = require("../services/recordingService");

async function uploadRecording(req, res) {
  const record = await recordingService.processUpload({
    file: req.file,
    userId: req.body.userId
  });

  res.status(201).json(
    successResponse(
      {
        recordingId: record.recordingId,
        userId: record.userId,
        createdAt: record.createdAt,
        fileUrl: record.fileUrl,
        analysis: record.analysis
      },
      "Audio uploaded and analyzed successfully."
    )
  );
}

async function getAnalysis(req, res) {
  const record = await recordingService.getAnalysis(req.params.id);

  res.json(
    successResponse(
      {
        recordingId: record.recordingId,
        userId: record.userId,
        createdAt: record.createdAt,
        analysis: record.analysis,
        fileUrl: record.fileUrl
      },
      "Analysis fetched successfully."
    )
  );
}

async function getHistory(req, res) {
  const history = await recordingService.getHistory(req.params.userId);

  res.json(
    successResponse(
      {
        userId: req.params.userId,
        total: history.length,
        recordings: history.map((item) => ({
          recordingId: item.recordingId,
          createdAt: item.createdAt,
          fileUrl: item.fileUrl,
          analysis: item.analysis
        }))
      },
      "History fetched successfully."
    )
  );
}

module.exports = {
  uploadRecording,
  getAnalysis,
  getHistory
};
