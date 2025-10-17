import * as reportService from '../services/reportService.js';

// Constants to avoid magic strings
const REPORT_TYPES = {
  WASTE_COLLECTION_SUMMARY: 'Waste Collection Summary',
  SENSOR_DATA: 'Sensor Data'
};

const HTTP_STATUS = {
  OK: 200,
  INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  REPORT_GENERATION_FAILED: 'Report generation failed',
  STATUS_COUNTS_FAILED: 'Failed to get status counts',
  SENSOR_STATUS_COUNTS_FAILED: 'Failed to get sensor data status counts',
  WASTE_TYPE_COUNTS_FAILED: 'Failed to get waste collection counts by type',
  CONTAINER_TYPE_COUNTS_FAILED: 'Failed to get sensor data counts by container type'
};

/**
 * Helper function to create standardized API responses
 */
const createApiResponse = (success, data = null, message = null, error = null) => ({
  success,
  ...(data && { data }),
  ...(message && { message }),
  ...(error && { error })
});

/**
 * Helper function to handle async operations with consistent error handling
 */
const handleAsyncOperation = async (operation, errorMessage) => {
  try {
    return await operation();
  } catch (error) {
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

/**
 * Validate report type parameter
 */
const isValidReportType = (reportType) => {
  return Object.values(REPORT_TYPES).includes(reportType);
};

/**
 * Extract and validate request parameters
 * Applies defensive programming principles
 */
const extractReportParams = (body) => {
  const { wasteType, status, startDate, endDate, reportType, province, containerType, city } = body;
  
  // Validate dates if provided
  const parsedStartDate = startDate ? new Date(startDate) : null;
  const parsedEndDate = endDate ? new Date(endDate) : null;
  
  if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
    throw new Error('Invalid start date format');
  }
  
  if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
    throw new Error('Invalid end date format');
  }
  
  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    throw new Error('Start date cannot be after end date');
  }
  
  return {
    wasteType: wasteType?.trim(),
    status: status?.trim(),
    startDate: parsedStartDate?.toISOString(),
    endDate: parsedEndDate?.toISOString(),
    reportType: reportType?.trim(),
    province: province?.trim(),
    containerType: containerType?.trim(),
    city: city?.trim()
  };
};

/**
 * Generate analytical report based on query params
 * Single responsibility: Coordinate report generation and return response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateReport = async (req, res) => {
  try {
    const params = extractReportParams(req.body);
    
    const result = await handleAsyncOperation(
      () => reportService.generateReportByType(params),
      ERROR_MESSAGES.REPORT_GENERATION_FAILED
    );

    return res.status(HTTP_STATUS.OK).json(createApiResponse(true, result));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, ERROR_MESSAGES.REPORT_GENERATION_FAILED, error.message)
    );
  }
};

/**
 * Generic count handler to eliminate code duplication
 * Single responsibility: Handle count requests with consistent error handling
 */
const handleCountRequest = async (req, res, serviceMethod, errorMessage) => {
  try {
    const result = await handleAsyncOperation(serviceMethod, errorMessage);
    return res.status(HTTP_STATUS.OK).json(createApiResponse(true, result));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, errorMessage, error.message)
    );
  }
};

/**
 * GET status counts endpoint
 * Single responsibility: Return waste collection status counts
 */
export const getStatusCounts = async (req, res) => {
  await handleCountRequest(
    req, 
    res, 
    reportService.getCountsByStatus, 
    ERROR_MESSAGES.STATUS_COUNTS_FAILED
  );
};

/**
 * GET sensor data status counts endpoint
 * Single responsibility: Return container status counts
 */
export const getSensorDataByStatus = async (req, res) => {
  await handleCountRequest(
    req, 
    res, 
    reportService.getSensorDataCountsByStatus, 
    ERROR_MESSAGES.SENSOR_STATUS_COUNTS_FAILED
  );
};

/**
 * GET waste collection counts by waste type endpoint
 * Single responsibility: Return waste type distribution
 */
export const getWasteCollectionByType = async (req, res) => {
  await handleCountRequest(
    req, 
    res, 
    reportService.getCountsByWasteType, 
    ERROR_MESSAGES.WASTE_TYPE_COUNTS_FAILED
  );
};

/**
 * GET sensor data counts by container type endpoint
 * Single responsibility: Return container type distribution
 */
export const getSensorDataByContainerType = async (req, res) => {
  await handleCountRequest(
    req, 
    res, 
    reportService.getSensorDataCountsByContainerType, 
    ERROR_MESSAGES.CONTAINER_TYPE_COUNTS_FAILED
  );
};
