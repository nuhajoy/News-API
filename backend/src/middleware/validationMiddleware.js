const { body, query, validationResult } = require("express-validator");
const { buildBaseResponse } = require("../utils/response");

function handleValidationResult(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const messages = errors.array().map((e) => `${e.param}: ${e.msg}`);
  const response = buildBaseResponse(false, "Validation failed", null, messages);
  return res.status(400).json(response);
}

const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .matches(/^[A-Za-z ]+$/)
    .withMessage("Name must contain only letters and spaces"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character"),
  body("role")
    .isIn(["author", "reader"])
    .withMessage("Role must be either 'author' or 'reader'"),
  handleValidationResult,
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationResult,
];

const articleCreateOrUpdateValidation = [
  body("title")
    .isLength({ min: 1, max: 150 })
    .withMessage("Title must be between 1 and 150 characters"),
  body("content")
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),
  body("category").notEmpty().withMessage("Category is required"),
  body("status")
    .optional()
    .isIn(["Draft", "Published"])
    .withMessage("Status must be either 'Draft' or 'Published'"),
  handleValidationResult,
];

const paginationValidation = [
  query("pageNumber").optional().isInt({ min: 1 }).toInt(),
  query("pageSize").optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidationResult,
];

module.exports = {
  signupValidation,
  loginValidation,
  articleCreateOrUpdateValidation,
  paginationValidation,
};

