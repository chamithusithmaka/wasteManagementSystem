import express from 'express';
import {
  getRewards,
} from '../controllers/rewardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);
router.get('/', getRewards); // List rewards (optionally filter by residentId or collectionId)

export default router;