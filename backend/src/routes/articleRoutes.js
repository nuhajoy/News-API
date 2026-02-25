const express = require("express");
const {
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
  getPublicArticles,
  getArticleById,
} = require("../controllers/articleController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");
const {
  articleCreateOrUpdateValidation,
  paginationValidation,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/", paginationValidation, getPublicArticles);
router.get("/:id", authenticate(true), getArticleById);

router.post(
  "/",
  authenticate(),
  requireRole("author"),
  articleCreateOrUpdateValidation,
  createArticle,
);

router.get(
  "/me",
  authenticate(),
  requireRole("author"),
  paginationValidation,
  getMyArticles,
);

router.put(
  "/:id",
  authenticate(),
  requireRole("author"),
  articleCreateOrUpdateValidation,
  updateArticle,
);

router.delete(
  "/:id",
  authenticate(),
  requireRole("author"),
  deleteArticle,
);

module.exports = router;

