import express from 'express';
import {
  getUserBills,
  getAllBills,
  getBillById,
  payBill,
  checkOutstandingBills,
  generateBill,
  payMultipleBills,
  batchPayBills,
  createTestBill,
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
router.get('/:id', getBillById);
router.post('/:id/pay', payBill);
router.post('/pay-multiple', payMultipleBills);
router.post('/batch-pay', batchPayBills);

// Admin routes
router.get('/admin/all', getAllBills);
router.post('/admin/generate/:collectionId', generateBill);
router.post('/admin/create-test-bill', createTestBill);


export default router;