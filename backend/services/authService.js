import User from '../models/User.js';
import jwt from 'jsonwebtoken';

class AuthService {
  // Find user by username
  static async findUserByUsername(username) {
    return await User.findOne({ username }).select('+password');
  }

  // Get user by ID (excluding password)
  static async getUserById(userId) {
    return await User.findById(userId).select('-password');
  }

  // Find user by username or email (for login - includes password)
  static async findUserByUsernameOrEmail(username, email) {
    return await User.findOne({ $or: [{ username }, { email }] }).select('+password');
  }

  // Create new user (password hashing handled in model)
  static async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // Authenticate user with password
  static async authenticateUser(user, password) {
    if (user.comparePassword) {
      return await user.comparePassword(password);
    }
    // Fallback for older User model without comparePassword method
    const bcrypt = await import('bcryptjs');
    return await bcrypt.compare(password, user.password);
  }

  // Generate JWT for user
  static generateJWT(user) {
    return jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  }

  // Refresh token (placeholder for future implementation)
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await this.getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }
      
      return this.generateJWT(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

export default AuthService;
