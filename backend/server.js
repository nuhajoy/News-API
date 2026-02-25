// Import the express module
const express = require("express");
// Import the dotenv module and call the config method to load the environment variables
require("dotenv").config();
const app = express()
// Import the sanitizer module
// const sanitize = require("sanitize");
// // Import the CORS module
// const cors = require("cors");
// // Set up the CORS options to allow requests from our front-end
// const corsOptions = {
//   origin: process.env.FRONTEND_URL,
//   optionsSuccessStatus: 200,
// };
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");
const authRoutes = require("./src/routes/authRoutes");
const articleRoutes = require("./src/routes/articleRoutes");
const authorRoutes = require("./src/routes/authorRoutes");
require("./src/jobs/analyticsJob");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/author", authorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

module.exports = app;
