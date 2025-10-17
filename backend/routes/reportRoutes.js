// Router for report generation
import express from 'express';
import { generateReport } from '../controllers/reportController.js';
import { getStatusCounts } from '../controllers/reportController.js';
import { getSensorDataByStatus } from '../controllers/reportController.js';
import { getWasteCollectionByType } from '../controllers/reportController.js';
import { getSensorDataByContainerType } from '../controllers/reportController.js';

const router = express.Router();

// POST /api/reports/generate
router.post('/generate', generateReport);

// GET /api/reports/status-counts
router.get('/status-counts', getStatusCounts);

// GET /api/reports/sensor-status-counts
router.get('/sensor-status-counts', getSensorDataByStatus);

// GET /api/reports/waste-type-counts
router.get('/waste-type-counts', getWasteCollectionByType);

// GET /api/reports/container-type-counts
router.get('/container-type-counts', getSensorDataByContainerType);

export default router;
