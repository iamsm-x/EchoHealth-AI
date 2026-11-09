const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { uploadDir } = require("./env");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || ".webm";
    cb(null, `${Date.now()}-${uuidv4()}${extension}`);
  }
});

const allowedMimeTypes = new Set([
  "audio/webm",
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/ogg",
  "audio/ogg; codecs=opus"
]);

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype || allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only audio uploads are supported."));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});
