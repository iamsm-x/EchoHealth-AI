function successResponse(data, message = "OK") {
  return {
    success: true,
    message,
    data
  };
}

function errorResponse(message, details) {
  return {
    success: false,
    message,
    ...(details ? { details } : {})
  };
}

module.exports = {
  successResponse,
  errorResponse
};
