const express = require("express");
const AppDataSource = require("./config/data-source");

const app = express();
app.use(express.json());

// POST /users - Register a new user
app.post("/users", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Get the User repository
    const userRepository = AppDataSource.getRepository("User");

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = userRepository.create({
      email,
      password, // In production, this should be hashed
      firstName: firstName || null,
      lastName: lastName || null,
    });

    // Save to database
    const savedUser = await userRepository.save(newUser);

    res.status(201).json({
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      createdAt: savedUser.createdAt,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
