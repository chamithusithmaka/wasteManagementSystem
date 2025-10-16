// Controller for report generation (SOLID, no code smells)
import WasteCollection from '../models/WasteCollection.js';
import * as reportService from '../services/reportService.js';

/**
 * Generate analytical report based on query params (excluding location)
 * Accepts: wasteType, status, startDate, endDate, reportType
 * Returns: aggregated data for frontend visualization
 */
export const generateReport = async (req, res) => {
  try {
    const { wasteType, status, startDate, endDate, reportType } = req.body;
    // Build query object
    const query = {};
    if (wasteType) query.wasteType = wasteType;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    // Fetch data
    const collections = await WasteCollection.find(query).lean();
    // Aggregate for reportType (simple example)
    let result;
    switch (reportType) {
      case 'Waste Collection Summary':
        result = {
          totalCollections: collections.length,
          totalWaste: collections.reduce((sum, c) => sum + (c.wasteAmount || 0), 0),
          byStatus: collections.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
          }, {})
        };
        break;
      case 'Sensor Data':
        result = collections.map(c => ({
          date: c.scheduledDate,
          fillLevel: c.containerFillLevel,
          wasteType: c.wasteType,
          status: c.status
        }));
        break;
      default:
        result = collections;
    }
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Report generation failed', error: err.message });
  }
};

/**
 * GET status counts endpoint
 * Query params optional: wasteType, startDate, endDate, status
 */
export const getStatusCounts = async (req, res) => {
  try {
    // Return counts for all documents (no filters)
    const { counts, total } = await reportService.getCountsByStatus();

    return res.status(200).json({ success: true, data: { counts, total } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to get status counts', error: err.message });
  }
};
