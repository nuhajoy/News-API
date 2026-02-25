const express = require("express");
const { getDashboard } = require("../controllers/authorController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");
const { paginationValidation } = require("../middleware/validationMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate(),
  requireRole("author"),
  paginationValidation,
  getDashboard,
);

module.exports = router;

