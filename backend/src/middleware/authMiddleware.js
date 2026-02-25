const jwt = require("jsonwebtoken");
const { buildBaseResponse } = require("../utils/response");

function authenticate(optional = false) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      if (optional) {
        return next();
      }
      const response = buildBaseResponse(false, "Authentication required", null, ["Missing token"]);
      return res.status(401).json(response);
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.sub, role: payload.role };
      next();
    } catch (err) {
      if (optional) {
        return next();
      }
      const response = buildBaseResponse(false, "Invalid or expired token", null, ["Unauthorized"]);
      return res.status(401).json(response);
    }
  };
}

module.exports = {
  authenticate,
};

