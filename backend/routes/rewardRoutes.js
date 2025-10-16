import express from 'express';
import {
  createReward,
  getRewards,
  getRewardById,
  updateReward,
  deleteReward,
} from '../controllers/rewardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

router.post('/', createReward); // Create reward
router.get('/', getRewards); // List rewards (optionally filter by residentId or collectionId)
router.get('/:id', getRewardById); // Get single reward
router.put('/:id', updateReward); // Update reward
router.delete('/:id', deleteReward); // Delete reward

export default router;