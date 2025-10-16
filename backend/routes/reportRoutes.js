// Router for report generation
import express from 'express';
import { generateReport } from '../controllers/reportController.js';
import { getStatusCounts } from '../controllers/reportController.js';
import { getSensorDataByStatus } from '../controllers/reportController.js';

const router = express.Router();

// POST /api/reports/generate
router.post('/generate', generateReport);

// GET /api/reports/status-counts
router.get('/status-counts', getStatusCounts);

// GET /api/reports/sensor-status-counts
router.get('/sensor-status-counts', getSensorDataByStatus);

export default router;
