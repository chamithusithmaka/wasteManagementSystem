import express from 'express';
import {
  getUserBills,
  checkOutstandingBills,
  payMultipleBills,
  batchPayBills,
  getCurrentMonthBills,
} from '../controllers/billController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User routes
router.get('/my-bills', getUserBills);
router.get('/check-outstanding', checkOutstandingBills);
router.get('/current-month', getCurrentMonthBills);
router.post('/pay-multiple', payMultipleBills);
router.post('/batch-pay', batchPayBills);

export default router;