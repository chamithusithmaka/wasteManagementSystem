import express from 'express';
import WasteCollectionController from '../controllers/wasteCollectionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import outstandingBillsMiddleware from '../middleware/outstandingBillsMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Check for outstanding bills before allowing schedule pickup
router.use(outstandingBillsMiddleware);

// User routes
router.post('/schedule', WasteCollectionController.schedulePickup);
router.get('/my-pickups', WasteCollectionController.getUserPickups);
router.get('/stats', WasteCollectionController.getUserStats);
router.get('/:id', WasteCollectionController.getPickup);
router.put('/:id', WasteCollectionController.updatePickup);
router.delete('/:id', WasteCollectionController.cancelPickup);

// Admin routes
router.get('/admin/all', WasteCollectionController.getAllPickups);
router.put('/admin/:id/assign', WasteCollectionController.assignStaff);
router.put('/admin/:id/complete', WasteCollectionController.completePickup);

export default router;