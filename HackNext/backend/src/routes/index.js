const express = require("express");
const recordingRoutes = require("./recordingRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const { successResponse } = require("../utils/apiResponse");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json(
    successResponse({
      status: "ok",
      service: "voice-diary-backend"
    })
  );
});

router.use("/api", recordingRoutes);
router.use("/api/analytics", analyticsRoutes);

module.exports = router;
