const db = require("../config/db.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { buildBaseResponse } = require("../utils/response");

async function signup(req, res, next) {
  const { name, email, password, role } = req.body;

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      const response = buildBaseResponse(false, "Signup failed", null, ["Email already in use"]);
      return res.status(409).json(response);
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.query(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [id, name, email, hashed, role],
    );

    const userObject = { id, name, email, role };
    const response = buildBaseResponse(true, "User registered successfully", userObject, null);
    return res.status(201).json(response);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    const users = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      const response = buildBaseResponse(false, "Invalid credentials", null, ["Invalid email or password"]);
      return res.status(401).json(response);
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const response = buildBaseResponse(false, "Invalid credentials", null, ["Invalid email or password"]);
      return res.status(401).json(response);
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    const responseObject = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    const response = buildBaseResponse(true, "Login successful", responseObject, null);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  signup,
  login,
};