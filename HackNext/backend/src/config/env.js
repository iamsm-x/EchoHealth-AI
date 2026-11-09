const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const rootDir = path.resolve(__dirname, "..", "..");

module.exports = {
  backendOrigin: process.env.BACKEND_ORIGIN || 'https://backend-deploy-jrip.onrender.com',
  port: Number(process.env.PORT || 5000),
  mlServiceUrl: process.env.ML_SERVICE_URL || "https://ai-ml-deploy.onrender.com/analyze",
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || "uploads"),
  dbHelperPath: process.env.DB_HELPER_PATH || "",
  moodBiomarkerScale: 10
};
