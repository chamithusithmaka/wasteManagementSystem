// Constants for container management
export const CONTAINER_CONSTANTS = {
  // Container Types
  TYPES: {
    ORGANIC: 'organic',
    POLYTHENE: 'polythene', 
    PLASTIC: 'plastic',
    GLASS: 'glass',
    METAL: 'metal',
    PAPER: 'paper',
    CARDBOARD: 'cardboard',
    MIXED: 'mixed',
    RECYCLABLE: 'recyclable',
    HAZARDOUS: 'hazardous',
    GENERAL: 'general'
  },

  // Container Status
  STATUS: {
    AVAILABLE: 'Available',
    NEAR_FULL: 'Near Full', 
    FULL: 'Full',
    NEEDS_MAINTENANCE: 'Needs Maintenance',
    OUT_OF_SERVICE: 'Out of Service'
  },

  // Fill Level Thresholds
  THRESHOLDS: {
    NEAR_FULL: 80,
    FULL: 95,
    HIGH_PRIORITY: 90
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50
  },

  // Default Values
  DEFAULTS: {
    COLLECTION_THRESHOLD: 80,
    MIN_CAPACITY: 1,
    DEFAULT_CAPACITY: 100
  }
};

// Sri Lankan Provinces
export const PROVINCES = [
  'Western Province',
  'Central Province', 
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province'
];

export default CONTAINER_CONSTANTS;