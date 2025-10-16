import express from 'express';
import AuthController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Signup route
router.post('/signup', AuthController.signup);
// Login route
router.post('/login', AuthController.login);
// Get logged-in user profile
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;
