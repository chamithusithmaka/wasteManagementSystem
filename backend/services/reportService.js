// Service: reportService
// Responsible for data access and aggregation logic for reports.
// Keeps controller free of DB implementation details (SRP).
import WasteCollection from '../models/WasteCollection.js';

/**
 * Build a MongoDB match object from optional filters.
 * Supported filters: wasteType, startDate, endDate, status
 */
export const buildMatchFromFilters = ({ wasteType, status, startDate, endDate } = {}) => {
  const match = {};
  if (wasteType) match.wasteType = wasteType;
  if (status) match.status = status;
  if (startDate || endDate) {
    match.scheduledDate = {};
    if (startDate) match.scheduledDate.$gte = new Date(startDate);
    if (endDate) match.scheduledDate.$lte = new Date(endDate);
  }
  return match;
};

/**
 * Returns counts grouped by status and total count.
 * Uses MongoDB aggregation to be efficient on large datasets.
 */
export const getCountsByStatus = async (filters = {}) => {
  const match = buildMatchFromFilters(filters);

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
  ];

  const rows = await WasteCollection.aggregate(pipeline).exec();

  // Convert array of {status, count} into an object map
  const counts = rows.reduce((acc, r) => {
    acc[r.status] = r.count;
    return acc;
  }, {});

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return { counts, total };
};

export default { buildMatchFromFilters, getCountsByStatus };
