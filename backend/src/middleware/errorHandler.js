const { buildBaseResponse } = require("../utils/response");

function notFoundHandler(req, res, next) {
  const response = buildBaseResponse(false, "Resource not found", null, ["Not Found"]);
  res.status(404).json(response);
}


function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || 500;
  const message = status === 500 ? "Something went wrong" : err.message || "Request failed";

  const response = buildBaseResponse(false, message, null, err.errors || null);
  res.status(status).json(response);
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

