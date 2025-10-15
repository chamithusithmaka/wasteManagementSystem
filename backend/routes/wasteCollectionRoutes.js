import express from 'express';
import WasteCollectionController from '../controllers/wasteCollectionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// User routes
router.post('/schedule', WasteCollectionController.schedulePickup);
router.get('/my-pickups', WasteCollectionController.getUserPickups);
router.get('/stats', WasteCollectionController.getUserStats);
router.get('/:id', WasteCollectionController.getPickup);
router.put('/:id', WasteCollectionController.updatePickup);
router.delete('/:id', WasteCollectionController.cancelPickup);

// Admin routes
router.get('/admin/all', adminMiddleware, WasteCollectionController.getAllPickups);
router.put('/admin/:id/assign', adminMiddleware, WasteCollectionController.assignStaff);
router.put('/admin/:id/complete', adminMiddleware, WasteCollectionController.completePickup);

export default router;