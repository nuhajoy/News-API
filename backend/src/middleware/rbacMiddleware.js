const { buildBaseResponse } = require("../utils/response");

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      const response = buildBaseResponse(false, "Forbidden", null, ["Forbidden"]);
      return res.status(403).json(response);
    }

    next();
  };
}

module.exports = {
  requireRole,
};

