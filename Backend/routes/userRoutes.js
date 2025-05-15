const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  console.log("Received data:", { name, email, password });

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Send success response
    res.status(201).json({ success: true, message: "User created successfully", user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "An error occurred while creating the user", error: error.message });
  }
});



// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }
  
      // Check if the password is correct
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ success: false, message: "Invalid password" });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: '2h' });
  
      // Send success response with token and username
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        name: user.name, // Include the username in the response
        email: user.email,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, message: "An error occurred while logging in", error: error.message });
    }
  });

module.exports = router;