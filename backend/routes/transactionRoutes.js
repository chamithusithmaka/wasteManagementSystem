import express from 'express';
import { getUserTransactions, getTransactionById, sendReceiptEmail } from '../controllers/transactionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Updated route for my transactions
router.get('/my-transactions', getUserTransactions);
router.get('/:id', getTransactionById);
// Add this new route
router.post('/send-receipt', sendReceiptEmail);

export default router;