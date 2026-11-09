const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { uploadDir } = require("./config/env");
const { errorResponse } = require("./utils/apiResponse");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));
app.use(routes);

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error.";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(errorResponse(message));
});

module.exports = app;
