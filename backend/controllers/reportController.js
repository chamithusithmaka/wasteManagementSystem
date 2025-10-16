// Controller for report generation (SOLID, no code smells)
import WasteCollection from '../models/WasteCollection.js';
import Container from '../models/Container.js';
import * as reportService from '../services/reportService.js';

/**
 * Generate analytical report based on query params (excluding location)
 * Accepts: wasteType, status, startDate, endDate, reportType
 * Returns: aggregated data for frontend visualization
 */
export const generateReport = async (req, res) => {
  try {
    const { wasteType, status, startDate, endDate, reportType } = req.body;
    // Build query object for WasteCollection
    const query = {};
    if (wasteType) query.wasteType = wasteType;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    let result;
    switch (reportType) {
      case 'Waste Collection Summary': {
        // Fetch data from WasteCollection
        const collections = await WasteCollection.find(query).lean();
        result = {
          totalCollections: collections.length,
          totalWaste: collections.reduce((sum, c) => sum + (c.wasteAmount || 0), 0),
          byStatus: collections.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
          }, {})
        };
        break;
      }
      case 'Sensor Data': {
        // Build query for Container model
        const containerQuery = {};
        // Accept both 'wasteType' and 'containerType' for compatibility
        const containerType = req.body.containerType || wasteType;
        if (containerType) containerQuery.containerType = containerType;
        if (status) containerQuery.status = status;
        if (req.body.city) containerQuery['containerLocation.city'] = req.body.city;
        if (startDate || endDate) {
          // Use lastUpdatedDate for sensor data time filtering
          containerQuery.lastUpdatedDate = {};
          if (startDate) containerQuery.lastUpdatedDate.$gte = new Date(startDate);
          if (endDate) containerQuery.lastUpdatedDate.$lte = new Date(endDate);
        }
        const containers = await Container.find(containerQuery).lean();
        // Summary counts by status
        const byStatus = containers.reduce((acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {});
        // Summary counts by type
        const byType = containers.reduce((acc, c) => {
          acc[c.containerType] = (acc[c.containerType] || 0) + 1;
          return acc;
        }, {});
        // Summary counts by city
        const byCity = containers.reduce((acc, c) => {
          const city = c.containerLocation?.city || 'Unknown';
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {});
        // Calculate total container capacity and total container level
        const totalContainerCapacity = containers.reduce((sum, c) => sum + (c.containerCapacity || 0), 0);
        const totalContainerLevel = containers.reduce((sum, c) => sum + (c.containerLevel || 0), 0);
        result = {
          totalContainers: containers.length,
          totalContainerCapacity,
          totalContainerLevel,
          byStatus,
          byType,
          byCity,
          containers: containers.map(c => ({
            containerId: c.containerId,
            type: c.containerType,
            location: c.containerLocation,
            capacity: c.containerCapacity,
            fillLevel: c.containerLevel,
            status: c.status,
            lastUpdated: c.lastUpdatedDate,
            isErrorDetected: c.isErrorDetected
          }))
        };
        break;
      }
      default: {
        // Default: WasteCollection with filters
        const collections = await WasteCollection.find(query).lean();
        result = collections;
      }
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

/**
 * GET sensor data status counts endpoint
 * Returns: Count of containers by each status
 */
export const getSensorDataByStatus = async (req, res) => {
  try {
    // Return counts for all sensor data (no filters)
    const { counts, total } = await reportService.getSensorDataCountsByStatus();

    return res.status(200).json({ success: true, data: { counts, total } });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get sensor data status counts', 
      error: err.message 
    });
  }
};
