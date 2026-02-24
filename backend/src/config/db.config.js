// db.config.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Load environment variables from .env
dotenv.config();

// Prepare connection parameters
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER ,
  password: process.env.DB_PASS ,
  database: process.env.DB_NAME ,
  port: process.env.DB_PORT ,
  connectionLimit: 10,
};

// Create a pool of connections
const pool = mysql.createPool(dbConfig);

// Function to execute queries
async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

module.exports = { query };
