const express = require('express');
const router = express.Router();
const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email: rawEmail, password } = req.body;
    if (!rawEmail || !password) throw new Error('Email and password are required');
    const email = String(rawEmail).trim().toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('User already exists');
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email: rawEmail, password } = req.body;
    if (!rawEmail || !password) {
      const err = new Error('Email and password are required');
      err.statusCode = 400;
      throw err;
    }
    const email = String(rawEmail).trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
