// install.js
const conn = require("../config/db.config"); 
const fs = require("fs");
const path = require("path");

// Function to create database tables
async function install() {
  const queryFile = __dirname + '/sql/initial.sql';; 
  let queries = [];
  let finalMessage = { success: [], failed: [] };
  let tempLine = "";

  try {
    // Read the SQL file
    const lines = fs.readFileSync(queryFile, "utf-8").split("\n");

    // Combine lines into full SQL queries
    lines.forEach((line) => {
      if (line.trim().startsWith("--") || line.trim() === "") return; // skip comments/empty
      tempLine += line;
      if (line.trim().endsWith(";")) {
        queries.push(tempLine.trim());
        tempLine = "";
      }
    });

    // Execute each query
    for (let i = 0; i < queries.length; i++) {
      try {
        await conn.query(queries[i]);
        console.log(
          `✅ Query executed successfully: ${queries[i].split(" ")[2] || "table"}`,
        );
        finalMessage.success.push(queries[i]);
      } catch (err) {
        console.error(
          `❌ Failed query: ${queries[i].split(" ")[2] || "table"}`,
          err.message,
        );
        finalMessage.failed.push({ query: queries[i], error: err.message });
      }
    }

    // Final status
    if (finalMessage.failed.length === 0) {
      finalMessage.message = "All tables created successfully!";
      finalMessage.status = 200;
    } else {
      finalMessage.message = "Some tables failed to create.";
      finalMessage.status = 500;
    }

    console.log(finalMessage); // print the result
  } catch (err) {
    console.error("Error reading SQL file:", err.message);
  }
}

// Immediately run the install function
install();
