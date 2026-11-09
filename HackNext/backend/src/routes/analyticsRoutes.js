const express = require("express");
const router = express.Router();
const analyticsService = require("../services/analyticsService");

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const summary = await analyticsService.getSummary(userId);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

router.get("/report/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const report = await analyticsService.generateClinicalReport(userId);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
