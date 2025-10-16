import express from 'express';
import { getWallet, addFunds, getTransactions, getRecentTransactions, getMyWallet } from '../controllers/walletController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Routes
router.post('/add-funds', addFunds);
router.get('/my-wallet', getMyWallet); // Add this route
router.get('/:residentId', getWallet);
router.get('/:residentId/transactions', getTransactions);
router.get('/:residentId/recent', getRecentTransactions);
// router.post('/email-receipt', emailReceipt);

export default router;