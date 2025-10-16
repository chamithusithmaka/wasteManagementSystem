import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import AuthService from '../services/authService.js';
import { validateSignup, validateLogin } from '../utils/validation.js';

class AuthController {
  // Get logged-in user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user._id;
      const user = await AuthService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to fetch profile.', error: err.message });
    }
  }
  // Signup: create new user
  static async signup(req, res) {
    try {
      const { name, username, email, password, role } = req.body;
      const validationError = validateSignup({ name, username, email, password });
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
      // Check if username or email exists
      const existingUser = await AuthService.findUserByUsernameOrEmail(username, email);
      if (existingUser) {
        return res.status(409).json({ message: 'Username or email already registered.' });
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create user
      const user = new User({ name, username, email, password: hashedPassword, role: role || 'user' });
      await user.save();
      return res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
      return res.status(500).json({ message: 'Signup failed.', error: err.message });
    }
  }

  // Login: authenticate user
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      const validationError = validateLogin({ username, password });
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
      // Find user by username
      const user = await AuthService.findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      // Generate JWT
      const token = AuthService.generateJWT(user);
      return res.status(200).json({
        message: 'Login successful.',
        token,
        user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role }
      });
    } catch (err) {
      return res.status(500).json({ message: 'Login failed.', error: err.message });
    }
  }
}


export default AuthController;
