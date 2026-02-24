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
// Create a variable to hold our port number
const port = process.env.PORT;
// Import the router

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
// Export the webserver for use in the application
module.exports = app;
