// Service: reportService
// Responsible for data access and aggregation logic for reports.
// Keeps controller free of DB implementation details (SRP).
import WasteCollection from '../models/WasteCollection.js';
import Container from '../models/Container.js';

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

/**
 * Returns sensor data counts grouped by status and total count.
 * Uses MongoDB aggregation for Container collection.
 */
export const getSensorDataCountsByStatus = async () => {
  const pipeline = [
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

  const rows = await Container.aggregate(pipeline).exec();

  // Convert array of {status, count} into an object map
  const counts = rows.reduce((acc, r) => {
    acc[r.status] = r.count;
    return acc;
  }, {});

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return { counts, total };
};

/**
 * Returns waste collection counts grouped by waste type and total count.
 * Uses MongoDB aggregation for WasteCollection collection.
 */
export const getCountsByWasteType = async () => {
  const pipeline = [
    {
      $group: {
        _id: '$wasteType',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        wasteType: '$_id',
        count: 1,
      },
    },
  ];

  const rows = await WasteCollection.aggregate(pipeline).exec();

  // Convert array of {wasteType, count} into an object map
  const counts = rows.reduce((acc, r) => {
    acc[r.wasteType] = r.count;
    return acc;
  }, {});

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return { counts, total };
};

/**
 * Returns sensor data counts grouped by container type and total count.
 * Uses MongoDB aggregation for Container collection.
 */
export const getSensorDataCountsByContainerType = async () => {
  const pipeline = [
    {
      $group: {
        _id: '$containerType',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        containerType: '$_id',
        count: 1,
      },
    },
  ];

  const rows = await Container.aggregate(pipeline).exec();

  // Convert array of {containerType, count} into an object map
  const counts = rows.reduce((acc, r) => {
    acc[r.containerType] = r.count;
    return acc;
  }, {});

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return { counts, total };
};

/**
 * Build query for waste collection data
 */
const buildWasteCollectionQuery = ({ wasteType, status, startDate, endDate, province }) => {
  const query = {};
  if (wasteType) query.wasteType = wasteType;
  if (status) query.status = status;
  if (province) query.province = province;
  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate);
    if (endDate) query.scheduledDate.$lte = new Date(endDate);
  }
  return query;
};

/**
 * Build query for container data
 */
const buildContainerQuery = ({ wasteType, containerType, status, startDate, endDate, city, province }) => {
  const query = {};
  const type = containerType || wasteType;
  if (type) query.containerType = type;
  if (status) query.status = status;
  if (city) query['containerLocation.city'] = city;
  if (province) query['containerLocation.province'] = province;
  if (startDate || endDate) {
    query.lastUpdatedDate = {};
    if (startDate) query.lastUpdatedDate.$gte = new Date(startDate);
    if (endDate) query.lastUpdatedDate.$lte = new Date(endDate);
  }
  return query;
};

/**
 * Process waste collection data for reporting
 */
const processWasteCollectionData = (collections) => {
  return {
    totalCollections: collections.length,
    totalWaste: collections.reduce((sum, c) => sum + (c.wasteAmount || 0), 0),
    byStatus: collections.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {})
  };
};

/**
 * Process container data for reporting
 */
const processContainerData = (containers) => {
  const byStatus = containers.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  
  const byType = containers.reduce((acc, c) => {
    acc[c.containerType] = (acc[c.containerType] || 0) + 1;
    return acc;
  }, {});
  
  const byCity = containers.reduce((acc, c) => {
    const city = c.containerLocation?.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const byProvince = containers.reduce((acc, c) => {
    const province = c.containerLocation?.province || 'Unknown';
    acc[province] = (acc[province] || 0) + 1;
    return acc;
  }, {});

  return {
    totalContainers: containers.length,
    totalContainerCapacity: containers.reduce((sum, c) => sum + (c.containerCapacity || 0), 0),
    totalContainerLevel: containers.reduce((sum, c) => sum + (c.containerLevel || 0), 0),
    byStatus,
    byType,
    byCity,
    byProvince,
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
};

/**
 * Generate report based on type - moved from controller to follow SRP
 */
export const generateReportByType = async (params) => {
  const { reportType } = params;
  
  switch (reportType) {
    case 'Waste Collection Summary': {
      const query = buildWasteCollectionQuery(params);
      const collections = await WasteCollection.find(query).lean();
      return processWasteCollectionData(collections);
    }
    
    case 'Sensor Data': {
      const query = buildContainerQuery(params);
      const containers = await Container.find(query).lean();
      return processContainerData(containers);
    }
    
    default: {
      const query = buildWasteCollectionQuery(params);
      const collections = await WasteCollection.find(query).lean();
      return collections;
    }
  }
};

export default { 
  buildMatchFromFilters, 
  getCountsByStatus, 
  getSensorDataCountsByStatus, 
  getCountsByWasteType, 
  getSensorDataCountsByContainerType,
  generateReportByType
};
