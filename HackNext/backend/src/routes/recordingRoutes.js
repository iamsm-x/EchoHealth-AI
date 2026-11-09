const express = require("express");
const upload = require("../config/upload");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/recordingController");

const router = express.Router();

router.post("/upload", upload.single("audio"), asyncHandler(controller.uploadRecording));
router.get("/analysis/:id", asyncHandler(controller.getAnalysis));
router.get("/history/:userId", asyncHandler(controller.getHistory));

module.exports = router;
