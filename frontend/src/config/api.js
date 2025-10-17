// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  
  // Container endpoints
  CONTAINERS: {
    BASE: `${API_BASE_URL}/containers`,
    GET_ALL: `${API_BASE_URL}/containers`,
    GET_BY_ID: (id) => `${API_BASE_URL}/containers/${id}`,
    CREATE: `${API_BASE_URL}/containers`,
    UPDATE: (id) => `${API_BASE_URL}/containers/${id}`,
    DELETE: (id) => `${API_BASE_URL}/containers/${id}`,
    DEACTIVATE: (id) => `${API_BASE_URL}/containers/${id}/deactivate`,
    GET_STATISTICS: `${API_BASE_URL}/containers/statistics`,
    GET_BY_STATUS: (status) => `${API_BASE_URL}/containers/status/${status}`,
    GET_BY_TYPE: (type) => `${API_BASE_URL}/containers/type/${type}`,
    GET_NEEDING_COLLECTION: `${API_BASE_URL}/containers/needing-collection`,
    SCHEDULE_COLLECTION: (id) => `${API_BASE_URL}/containers/${id}/schedule-collection`, // Add this line
  },
  
  // Waste collection endpoints
  WASTE_COLLECTION: {
    BASE: `${API_BASE_URL}/waste-collection`,
    SCHEDULE: `${API_BASE_URL}/waste-collection/schedule`,
    GET_ALL: `${API_BASE_URL}/waste-collection`,
  },
};

export default API_BASE_URL;
