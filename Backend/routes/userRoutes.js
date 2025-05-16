const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  console.log("Received data:", { name, email, password });

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ success: true, message: "User created successfully", user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "An error occurred while creating the user", error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: '2h' });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "An error occurred while logging in", error: error.message });
  }
});

module.exports = router;
