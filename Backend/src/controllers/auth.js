// Auth Controller - Handle authentication
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { full_name, email, password, phone, ward_number } = req.body;

    // Validate input
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      phone,
      ward_number
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: "Registration successful", token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Verify credentials
    const user = await User.verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if disabled
    if (user.is_disabled) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout (client-side)
export const logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};
