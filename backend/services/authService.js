import User from '../models/User.js';
import jwt from 'jsonwebtoken';

class AuthService {
  // Find user by username
  static async findUserByUsername(username) {
    return await User.findOne({ username });
  }

  // Get user by ID (excluding password)
  static async getUserById(userId) {
    return await User.findById(userId).select('-password');
  }

  // Find user by username or email
  static async findUserByUsernameOrEmail(username, email) {
    return await User.findOne({ $or: [{ username }, { email }] });
  }

  // Generate JWT for user
  static generateJWT(user) {
    return jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  }
}

export default AuthService;
