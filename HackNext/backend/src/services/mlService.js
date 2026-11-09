const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { mlServiceUrl } = require("../config/env");

async function analyzeAudio(file) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(file.path), file.originalname);

  const response = await axios.post(mlServiceUrl, formData, {
    headers: formData.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 30000
  });

  return response.data;
}

module.exports = {
  analyzeAudio
};
