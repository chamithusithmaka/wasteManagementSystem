import express from 'express';
import { getUserTransactions, getTransactionById, sendReceiptEmail } from '../controllers/transactionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/my-transactions', getUserTransactions);
router.get('/:id', getTransactionById);
router.post('/send-receipt', sendReceiptEmail);

export default router;