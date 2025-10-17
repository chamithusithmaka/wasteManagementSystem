

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Note: Install 'validator' package for enhanced email validation
// npm install validator
// For now, using built-in email validation

// Constants to avoid magic numbers and strings
const USER_CONSTANTS = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin'
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    SALT_ROUNDS: 12
  },
  REGEX: {
    USERNAME: /^[a-zA-Z0-9_-]+$/,
    PASSWORD_STRENGTH: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  }
};

// Custom validation functions following Single Responsibility Principle
const validators = {
  /**
   * Validate email format using built-in regex
   * For enhanced validation, consider installing 'validator' package
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  /**
   * Validate username format and length
   */
  isValidUsername: (username) => {
    return username.length >= USER_CONSTANTS.VALIDATION.MIN_USERNAME_LENGTH &&
           username.length <= USER_CONSTANTS.VALIDATION.MAX_USERNAME_LENGTH &&
           USER_CONSTANTS.REGEX.USERNAME.test(username);
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password) => {
    return password.length >= USER_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH &&
           password.length <= USER_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH &&
           USER_CONSTANTS.REGEX.PASSWORD_STRENGTH.test(password);
  },

  /**
   * Validate name format and length
   */
  isValidName: (name) => {
    const trimmedName = name.trim();
    return trimmedName.length >= USER_CONSTANTS.VALIDATION.MIN_NAME_LENGTH &&
           trimmedName.length <= USER_CONSTANTS.VALIDATION.MAX_NAME_LENGTH &&
           /^[a-zA-Z\s]+$/.test(trimmedName);
  }
};

// Enhanced user schema with comprehensive validation
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [USER_CONSTANTS.VALIDATION.MIN_NAME_LENGTH, `Name must be at least ${USER_CONSTANTS.VALIDATION.MIN_NAME_LENGTH} characters`],
    maxlength: [USER_CONSTANTS.VALIDATION.MAX_NAME_LENGTH, `Name cannot exceed ${USER_CONSTANTS.VALIDATION.MAX_NAME_LENGTH} characters`],
    validate: {
      validator: validators.isValidName,
      message: 'Name can only contain letters and spaces'
    }
  },
  
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [USER_CONSTANTS.VALIDATION.MIN_USERNAME_LENGTH, `Username must be at least ${USER_CONSTANTS.VALIDATION.MIN_USERNAME_LENGTH} characters`],
    maxlength: [USER_CONSTANTS.VALIDATION.MAX_USERNAME_LENGTH, `Username cannot exceed ${USER_CONSTANTS.VALIDATION.MAX_USERNAME_LENGTH} characters`],
    validate: {
      validator: validators.isValidUsername,
      message: 'Username can only contain letters, numbers, hyphens, and underscores'
    },
    index: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validators.isValidEmail,
      message: 'Please provide a valid email address'
    },
    index: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [USER_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${USER_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`],
    maxlength: [USER_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH, `Password cannot exceed ${USER_CONSTANTS.VALIDATION.MAX_PASSWORD_LENGTH} characters`],
    validate: {
      validator: validators.isValidPassword,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    },
    select: false // Don't include password in queries by default
  },
  
  role: {
    type: String,
    enum: {
      values: Object.values(USER_CONSTANTS.ROLES),
      message: 'Role must be either user or admin'
    },
    default: USER_CONSTANTS.ROLES.USER,
    required: [true, 'Role is required'],
    index: true
  },
  
  // Additional fields for enhanced functionality
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  lastLoginAt: {
    type: Date,
    default: null
  },
  
  failedLoginAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  
  accountLockedUntil: {
    type: Date,
    default: null
  },
  
  // Metadata for audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  // Enable strict mode for better data integrity
  strict: true,
  // Add version key for optimistic concurrency control
  versionKey: '__v'
});

// Compound indexes for better query performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ username: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Pre-save middleware for password hashing (Single Responsibility)
userSchema.pre('save', async function(next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    // Hash password with salt
    const saltRounds = USER_CONSTANTS.VALIDATION.SALT_ROUNDS;
    this.password = await bcrypt.hash(this.password, saltRounds);
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods (following Interface Segregation Principle)

/**
 * Compare password for authentication
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Check if user is admin
 * @returns {boolean} - True if user is admin
 */
userSchema.methods.isAdmin = function() {
  return this.role === USER_CONSTANTS.ROLES.ADMIN;
};

/**
 * Check if user account is locked
 * @returns {boolean} - True if account is locked
 */
userSchema.methods.isAccountLocked = function() {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

/**
 * Increment failed login attempts
 */
userSchema.methods.incrementFailedLoginAttempts = function() {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  return this.save();
};

/**
 * Reset failed login attempts
 */
userSchema.methods.resetFailedLoginAttempts = function() {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  this.lastLoginAt = new Date();
  return this.save();
};

/**
 * Get public profile (excluding sensitive information)
 * @returns {Object} - Public user profile
 */
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastLoginAt: this.lastLoginAt
  };
};

/**
 * Soft delete user (instead of hard delete)
 */
userSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

/**
 * Reactivate user account
 */
userSchema.methods.activate = function() {
  this.isActive = true;
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  return this.save();
};

// Static methods (Class-level operations)

/**
 * Find active users only
 */
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

/**
 * Find users by role
 */
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

/**
 * Search users by name or username
 */
userSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: searchRegex },
          { username: searchRegex }
        ]
      }
    ]
  });
};

// Transform JSON output to exclude sensitive information by default
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Create and export the model
const User = mongoose.model('User', userSchema);

// Export both the model and constants for use in other modules
export default User;
export { USER_CONSTANTS, validators };
