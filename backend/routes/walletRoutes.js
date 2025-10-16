import express from 'express';
import { getWallet, addFunds, getTransactions, getRecentTransactions, emailReceipt} from '../controllers/walletController.js';

const router = express.Router();

router.get('/:residentId', getWallet); // GET /api/wallet/:residentId
router.post('/:residentId/add', addFunds); // POST /api/wallet/:residentId/add
router.get('/:residentId/transactions', getTransactions); // GET /api/wallet/:residentId/transactions
router.get('/:residentId/recent', getRecentTransactions);
router.post('/email-receipt', emailReceipt); // POST /api/wallet/em
export default router;